import { useState, useCallback, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, RotateCcw, Trophy, Zap } from 'lucide-react';
import { Card, CardContent, CardTitle, Badge, Button } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { recordQuizResult } from '@/services/pointsService';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: 'What percentage of municipal waste can be recycled if properly segregated?',
    options: ['30%', '50%', '70%', '90%'],
    correctAnswer: 2,
    category: '♻️ Waste Management',
    explanation: 'Studies show up to 70% of municipal waste is recyclable when properly segregated at source.',
  },
  {
    id: 2,
    question: 'Which is the most effective way to conserve water in urban areas?',
    options: ['Rainwater harvesting', 'Shorter showers only', 'Using bottled water', 'Waiting for rain'],
    correctAnswer: 0,
    category: '💧 Water Conservation',
    explanation: 'Rainwater harvesting captures and stores rainwater for reuse, significantly reducing dependence on municipal supply.',
  },
  {
    id: 3,
    question: 'What is the ideal response time for fixing a pothole on a main road?',
    options: ['1 week', '48 hours', '1 month', '6 months'],
    correctAnswer: 1,
    category: '🕳️ Infrastructure',
    explanation: 'Best practices suggest potholes on main roads should be addressed within 48 hours to prevent accidents.',
  },
  {
    id: 4,
    question: 'How many trees are needed to offset one person\'s annual carbon footprint?',
    options: ['5 trees', '10 trees', '20 trees', '50 trees'],
    correctAnswer: 2,
    category: '🌳 Environment',
    explanation: 'On average, 20 mature trees are needed to absorb the CO2 produced by one person annually.',
  },
  {
    id: 5,
    question: 'What is the proper way to report a civic issue for fastest resolution?',
    options: ['Social media post', 'Official grievance portal', 'Informal complaint', 'Newspaper letter'],
    correctAnswer: 1,
    category: '📋 Civic Reporting',
    explanation: 'Official grievance portals have tracking systems and mandated response times for authorities.',
  },
  {
    id: 6,
    question: 'Which type of waste takes the longest to decompose?',
    options: ['Paper (2-5 months)', 'Plastic bags (20 years)', 'Glass (1 million years)', 'Styrofoam (500 years)'],
    correctAnswer: 2,
    category: '♻️ Waste Management',
    explanation: 'Glass is one of the longest lasting man-made materials, taking approximately 1 million years to decompose.',
  },
  {
    id: 7,
    question: 'What percentage of India\'s urban population has access to piped water?',
    options: ['40%', '55%', '70%', '90%'],
    correctAnswer: 1,
    category: '💧 Water Conservation',
    explanation: 'Approximately 55% of India\'s urban population has piped water access, highlighting the need for better infrastructure.',
  },
  {
    id: 8,
    question: 'Which initiative reduces urban heat island effect most effectively?',
    options: ['White rooftops', 'More AC units', 'Taller buildings', 'Wider roads'],
    correctAnswer: 0,
    category: '🌳 Environment',
    explanation: 'White/cool rooftops reflect sunlight and reduce heat absorption, lowering local temperatures by 2-3°C.',
  },
  {
    id: 9,
    question: 'What is the recommended noise level for residential areas?',
    options: ['35 dB', '55 dB', '75 dB', '90 dB'],
    correctAnswer: 1,
    category: '🏘️ Community',
    explanation: 'WHO recommends 55 dB as the daytime limit for residential areas to prevent health issues.',
  },
  {
    id: 10,
    question: 'How much energy is saved by recycling one aluminum can?',
    options: ['Enough to run a TV for 1 hour', 'Enough to run a TV for 3 hours', 'Enough to run a TV for 6 hours', 'Enough to run a TV for 12 hours'],
    correctAnswer: 1,
    category: '♻️ Waste Management',
    explanation: 'Recycling one aluminum can saves enough energy to run a TV for 3 hours.',
  },
  {
    id: 11,
    question: 'What is the best practice for street lighting maintenance?',
    options: ['Replace when broken', 'Scheduled preventive checks', 'Wait for complaints', 'Annual audit only'],
    correctAnswer: 1,
    category: '🕳️ Infrastructure',
    explanation: 'Scheduled preventive maintenance catches issues before failure, ensuring public safety.',
  },
  {
    id: 12,
    question: 'Which community action has the highest impact on local cleanliness?',
    options: ['Individual cleanup', 'Organized community drive', 'Government orders', 'Fines only'],
    correctAnswer: 1,
    category: '🏘️ Community',
    explanation: 'Organized community drives create collective ownership and lasting behavioral change.',
  },
];

type QuizState = 'idle' | 'playing' | 'finished';

export default function QuizPage() {
  const { user } = useAuth();
  const [state, setState] = useState<QuizState>('idle');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<(boolean | null)[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [alreadyAttemptedToday, setAlreadyAttemptedToday] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<QuizQuestion[]>([]);

  const categories = [...new Set(QUIZ_QUESTIONS.map((q) => q.category))];

  const filteredQuestions = selectedCategory
    ? QUIZ_QUESTIONS.filter((q) => q.category === selectedCategory)
    : QUIZ_QUESTIONS;

  // Check if user already took quiz today (from quiz history in Firestore)
  useEffect(() => {
    async function checkTodayAttempt() {
      if (!user) return;
      try {
        const { loadUserPoints } = await import('@/services/pointsService');
        const data = await loadUserPoints(user.uid);
        const today = new Date().toISOString().split('T')[0];
        const attemptedToday = data.quizHistory.some(
          (h) => h.date.split('T')[0] === today
        );
        setAlreadyAttemptedToday(attemptedToday);
      } catch { /* ignore */ }
    }
    checkTodayAttempt();
  }, [user]);

  // Shuffle questions for randomized order
  const shuffleArray = (arr: QuizQuestion[]) => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startQuiz = useCallback(() => {
    const questions = selectedCategory
      ? QUIZ_QUESTIONS.filter((q) => q.category === selectedCategory)
      : QUIZ_QUESTIONS;
    setShuffledQuestions(shuffleArray(questions));
    setState('playing');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setScore(0);
    setAnswers([]);
    setPointsAwarded(0);
  }, [selectedCategory]);

  // Use shuffled questions during gameplay
  const activeQuestions = state === 'playing' || state === 'finished' ? shuffledQuestions : filteredQuestions;

  const handleAnswer = (answerIdx: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answerIdx);
    setShowExplanation(true);

    const isCorrect = answerIdx === activeQuestions[currentQuestion].correctAnswer;
    if (isCorrect) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, isCorrect]);
  };

  const nextQuestion = async () => {
    if (currentQuestion + 1 >= activeQuestions.length) {
      setState('finished');
      // Save quiz result — only award points if not already attempted today
      if (user && !alreadyAttemptedToday) {
        try {
          const finalScore = score + (selectedAnswer === activeQuestions[currentQuestion].correctAnswer ? 1 : 0);
          const result = await recordQuizResult(user.uid, finalScore, activeQuestions.length);
          setPointsAwarded(result.pointsEarned);
          setAlreadyAttemptedToday(true);
        } catch (err) {
          console.error('[Quiz] Failed to save result:', err);
        }
      }
    } else {
      setCurrentQuestion((q) => q + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const getScoreEmoji = () => {
    const pct = (score / activeQuestions.length) * 100;
    if (pct >= 90) return '🏆';
    if (pct >= 70) return '🌟';
    if (pct >= 50) return '👍';
    return '📚';
  };

  const getScoreMessage = () => {
    const pct = (score / activeQuestions.length) * 100;
    if (pct >= 90) return 'Outstanding! You\'re a civic genius!';
    if (pct >= 70) return 'Great job! You know your community well.';
    if (pct >= 50) return 'Good effort! Keep learning about civic issues.';
    return 'Keep exploring! Every question teaches something new.';
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
          <Brain className="h-7 w-7 text-secondary-500" />
          Eco & Community Quiz
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Test your knowledge about civic issues and earn bonus points
        </p>
      </div>

      {/* Idle State — Category selection */}
      {state === 'idle' && (
        <>
          {/* Category Badges */}
          <Card>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-accent-500" />
              Choose a Category
            </CardTitle>
            <CardContent className="mt-4">
              <div className="flex flex-wrap gap-2 mb-6">
                <Button
                  variant={selectedCategory === null ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  All Topics ({QUIZ_QUESTIONS.length})
                </Button>
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat} ({QUIZ_QUESTIONS.filter((q) => q.category === cat).length})
                  </Button>
                ))}
              </div>

              <div className="text-center py-8">
                <span className="text-6xl block mb-4">🧠</span>
                <h2 className="text-xl font-bold text-neutral-800 dark:text-white mb-2">
                  Ready to Test Your Knowledge?
                </h2>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 max-w-md mx-auto">
                  Answer questions about environmental awareness, civic responsibility, and community issues.
                  Earn +20 points for a perfect score!
                </p>
                <Button size="lg" onClick={startQuiz} disabled={alreadyAttemptedToday}>
                  <Zap className="h-4 w-4" />
                  {alreadyAttemptedToday ? 'Already Attempted Today' : `Start Quiz (${filteredQuestions.length} Questions)`}
                </Button>
                {alreadyAttemptedToday && (
                  <p className="text-xs text-neutral-400 mt-2">
                    You can earn points again tomorrow. Come back for a new attempt!
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quiz Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card hoverable className="text-center !p-4">
              <span className="text-2xl">📝</span>
              <p className="text-lg font-bold text-neutral-800 dark:text-white mt-1">{QUIZ_QUESTIONS.length}</p>
              <p className="text-[11px] text-neutral-500">Total Questions</p>
            </Card>
            <Card hoverable className="text-center !p-4">
              <span className="text-2xl">📂</span>
              <p className="text-lg font-bold text-neutral-800 dark:text-white mt-1">{categories.length}</p>
              <p className="text-[11px] text-neutral-500">Categories</p>
            </Card>
            <Card hoverable className="text-center !p-4">
              <span className="text-2xl">🎯</span>
              <p className="text-lg font-bold text-neutral-800 dark:text-white mt-1">+20</p>
              <p className="text-[11px] text-neutral-500">Max Points</p>
            </Card>
            <Card hoverable className="text-center !p-4">
              <span className="text-2xl">⏱️</span>
              <p className="text-lg font-bold text-neutral-800 dark:text-white mt-1">No Limit</p>
              <p className="text-[11px] text-neutral-500">Time</p>
            </Card>
          </div>
        </>
      )}

      {/* Playing State */}
      {state === 'playing' && (
        <Card>
          {/* Progress */}
          <div className="flex items-center justify-between mb-4">
            <Badge variant="neutral" size="sm">
              Question {currentQuestion + 1} of {activeQuestions.length}
            </Badge>
            <Badge variant="primary" size="sm">
              Score: {score}/{currentQuestion + (selectedAnswer !== null ? 1 : 0)}
            </Badge>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden mb-6">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / activeQuestions.length) * 100}%` }}
            />
          </div>

          {/* Category Badge */}
          <Badge variant="secondary" size="sm" className="mb-3">
            {activeQuestions[currentQuestion].category}
          </Badge>

          {/* Question */}
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-6">
            {activeQuestions[currentQuestion].question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {activeQuestions[currentQuestion].options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === activeQuestions[currentQuestion].correctAnswer;
              const showResult = selectedAnswer !== null;

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={selectedAnswer !== null}
                  className={cn(
                    'w-full text-left p-4 rounded-[14px] border-2 transition-all duration-200 flex items-center gap-3',
                    !showResult && 'hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/5 border-neutral-200 dark:border-neutral-700',
                    showResult && isCorrect && 'border-success-400 bg-success-50 dark:bg-success-500/10',
                    showResult && isSelected && !isCorrect && 'border-danger-400 bg-danger-50 dark:bg-danger-500/10',
                    showResult && !isSelected && !isCorrect && 'border-neutral-200 dark:border-neutral-700 opacity-50',
                  )}
                >
                  <span className={cn(
                    'flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold shrink-0',
                    !showResult && 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300',
                    showResult && isCorrect && 'bg-success-200 dark:bg-success-600 text-success-800 dark:text-white',
                    showResult && isSelected && !isCorrect && 'bg-danger-200 dark:bg-danger-600 text-danger-800 dark:text-white',
                  )}>
                    {showResult && isCorrect ? <CheckCircle className="h-4 w-4" /> : showResult && isSelected ? <XCircle className="h-4 w-4" /> : String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="mt-4 p-4 rounded-[14px] bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                <span className="font-semibold">💡 Explanation:</span>{' '}
                {activeQuestions[currentQuestion].explanation}
              </p>
            </div>
          )}

          {/* Next Button */}
          {selectedAnswer !== null && (
            <div className="mt-6 flex justify-end">
              <Button onClick={nextQuestion}>
                {currentQuestion + 1 >= activeQuestions.length ? 'See Results' : 'Next Question →'}
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Finished State */}
      {state === 'finished' && (
        <Card className="text-center py-8">
          <span className="text-6xl block mb-4">{getScoreEmoji()}</span>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
            Quiz Complete!
          </h2>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-2">
            You scored <span className="font-bold text-primary-600 dark:text-primary-400">{score}</span> out of <span className="font-bold">{activeQuestions.length}</span>
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
            {getScoreMessage()}
          </p>

          {/* Score Breakdown */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {answers.map((correct, idx) => (
              <div
                key={idx}
                className={cn(
                  'h-3 w-3 rounded-full',
                  correct ? 'bg-success-500' : 'bg-danger-400'
                )}
                title={`Q${idx + 1}: ${correct ? 'Correct' : 'Wrong'}`}
              />
            ))}
          </div>

          {/* Points earned */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-500/10 mb-6">
            <Trophy className="h-4 w-4 text-primary-600 dark:text-primary-400" />
            <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
              {pointsAwarded > 0 ? `+${pointsAwarded} points earned` : 'Practice mode — no points (1 attempt/day)'}
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Button variant="outline" onClick={() => setState('idle')}>
              <RotateCcw className="h-4 w-4" />
              Play Again
            </Button>
            <Button onClick={startQuiz}>
              <Zap className="h-4 w-4" />
              Retry Same Quiz
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
