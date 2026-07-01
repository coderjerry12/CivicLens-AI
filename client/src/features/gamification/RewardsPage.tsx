import { useState, useEffect } from 'react';
import { Gift, Star, TrendingUp, ShieldCheck, Lock, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardTitle, Badge, Button } from '@/components/ui';
import { useAuth } from '@/features/auth';
import { useRecentReports, useProfile } from '@/hooks';
import { cn } from '@/lib/utils';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  cost: number;
  category: 'certificate' | 'badge' | 'voucher' | 'perk';
}

const ALL_REWARDS: Reward[] = [
  {
    id: 'r1',
    name: 'Active Citizen Certificate',
    description: 'Digital certificate recognizing your civic contributions',
    icon: '📜',
    cost: 100,
    category: 'certificate',
  },
  {
    id: 'r2',
    name: 'Community Guardian Badge',
    description: 'Exclusive profile badge showing your guardian status',
    icon: '🛡️',
    cost: 150,
    category: 'badge',
  },
  {
    id: 'r3',
    name: 'Eco Warrior Certificate',
    description: 'Certificate for environmental issue reporting',
    icon: '🌿',
    cost: 200,
    category: 'certificate',
  },
  {
    id: 'r4',
    name: 'Priority Reporter Perk',
    description: 'Your issues get flagged for faster processing',
    icon: '⚡',
    cost: 300,
    category: 'perk',
  },
  {
    id: 'r5',
    name: 'City Champion Badge',
    description: 'Golden badge for top community contributors',
    icon: '🏆',
    cost: 500,
    category: 'badge',
  },
  {
    id: 'r6',
    name: 'Community Leader Certificate',
    description: 'Official recognition as a community leader',
    icon: '👑',
    cost: 750,
    category: 'certificate',
  },
  {
    id: 'r7',
    name: 'Feature Request Priority',
    description: 'Submit feature suggestions that get reviewed first',
    icon: '💡',
    cost: 400,
    category: 'perk',
  },
  {
    id: 'r8',
    name: 'Volunteer Appreciation',
    description: 'Digital appreciation voucher for community service',
    icon: '🎖️',
    cost: 250,
    category: 'voucher',
  },
];

export default function RewardsPage() {
  const { user } = useAuth();
  const { reports } = useRecentReports(100);
  const { reputation } = useProfile(reports);

  const [redeemedIds, setRedeemedIds] = useState<string[]>([]);
  const [spentPoints, setSpentPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'certificate' | 'badge' | 'voucher' | 'perk'>('all');

  // Available points = earned - spent
  const availablePoints = reputation.score - spentPoints;

  // Load redeemed rewards from Firestore on mount
  useEffect(() => {
    async function loadRedemptions() {
      if (!user) return;
      try {
        const docRef = doc(db, 'userRewards', user.uid);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setRedeemedIds(data.redeemedIds || []);
          setSpentPoints(data.spentPoints || 0);
        }
      } catch (err) {
        console.error('[Rewards] Load failed:', err);
      }
      setLoading(false);
    }
    loadRedemptions();
  }, [user]);

  // Persist redemption to Firestore
  const handleRedeem = async (rewardId: string) => {
    if (!user) return;
    const reward = ALL_REWARDS.find((r) => r.id === rewardId);
    if (!reward) return;
    if (availablePoints < reward.cost) return;

    const newRedeemedIds = [...redeemedIds, rewardId];
    const newSpentPoints = spentPoints + reward.cost;

    // Optimistic update
    setRedeemedIds(newRedeemedIds);
    setSpentPoints(newSpentPoints);

    // Save to Firestore
    try {
      const docRef = doc(db, 'userRewards', user.uid);
      await setDoc(docRef, {
        redeemedIds: newRedeemedIds,
        spentPoints: newSpentPoints,
        lastUpdated: new Date().toISOString(),
      });
    } catch (err) {
      console.error('[Rewards] Save failed:', err);
      // Revert on failure
      setRedeemedIds(redeemedIds);
      setSpentPoints(spentPoints);
    }
  };

  const filteredRewards = filter === 'all' ? ALL_REWARDS : ALL_REWARDS.filter((r) => r.category === filter);

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'certificate': return '📜';
      case 'badge': return '🏅';
      case 'voucher': return '🎫';
      case 'perk': return '⚡';
      default: return '🎁';
    }
  };

  if (loading) {
    return (
      <div className="p-4 lg:p-6 space-y-6">
        <div className="h-32 rounded-[20px] bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-[20px] bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Gift className="h-7 w-7 text-accent-500" />
          Rewards & Redemption
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
          Redeem your points for certificates, badges, and exclusive perks
        </p>
      </div>

      {/* Points Balance */}
      <Card className="bg-gradient-to-r from-accent-500 to-primary-600 dark:from-accent-600 dark:to-primary-700 text-white !border-0">
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/70">Available Points</p>
            <p className="text-4xl font-bold">{availablePoints}</p>
            <p className="text-sm text-white/80 mt-1">
              {reputation.level} • {spentPoints > 0 ? `${spentPoints} spent` : 'Keep earning!'}
            </p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center">
              <Star className="h-8 w-8 text-white" />
            </div>
            <span className="text-xs text-white/70">{reports.length} reports</span>
          </div>
        </CardContent>
      </Card>

      {/* How to Earn */}
      <Card>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-success-500" />
          How to Earn More Points
        </CardTitle>
        <CardContent className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { action: 'Report Issue', points: '+10', icon: '📋' },
              { action: 'Resolved', points: '+25', icon: '✅' },
              { action: 'Daily Streak', points: '+3', icon: '🔥' },
              { action: 'Challenge', points: '+15', icon: '🎯' },
              { action: 'Quiz Win', points: '+20', icon: '🧠' },
              { action: 'Upvote', points: '+5', icon: '👍' },
            ].map((item) => (
              <div key={item.action} className="text-center p-3 rounded-[12px] bg-neutral-50 dark:bg-neutral-800/50">
                <span className="text-2xl block">{item.icon}</span>
                <p className="text-[10px] text-neutral-600 dark:text-neutral-400 mt-1">{item.action}</p>
                <p className="text-xs font-bold text-success-600 dark:text-success-400">{item.points}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {([
          { key: 'all', label: 'All Rewards' },
          { key: 'certificate', label: '📜 Certificates' },
          { key: 'badge', label: '🏅 Badges' },
          { key: 'voucher', label: '🎫 Vouchers' },
          { key: 'perk', label: '⚡ Perks' },
        ] as const).map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRewards.map((reward) => {
          const isRedeemed = redeemedIds.includes(reward.id);
          const canAfford = availablePoints >= reward.cost;

          return (
            <Card
              key={reward.id}
              hoverable
              className={cn(
                'relative overflow-hidden',
                !canAfford && !isRedeemed && 'opacity-60',
                isRedeemed && 'ring-2 ring-success-400'
              )}
            >
              {/* Category tag */}
              <Badge
                variant={reward.category === 'certificate' ? 'primary' : reward.category === 'badge' ? 'accent' : reward.category === 'perk' ? 'secondary' : 'neutral'}
                size="sm"
                className="absolute top-4 right-4"
              >
                {getCategoryIcon(reward.category)} {reward.category}
              </Badge>

              <CardContent>
                <div className="flex flex-col items-center text-center pt-2">
                  <span className="text-4xl mb-3">{reward.icon}</span>
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-1">{reward.name}</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-4">{reward.description}</p>

                  {/* Cost */}
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="h-4 w-4 text-accent-500" />
                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{reward.cost} points</span>
                  </div>

                  {/* Action Button */}
                  {isRedeemed ? (
                    <Badge variant="success" size="lg" className="w-full justify-center">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Redeemed
                    </Badge>
                  ) : canAfford ? (
                    <Button
                      size="sm"
                      variant="primary"
                      className="w-full"
                      onClick={() => handleRedeem(reward.id)}
                    >
                      <Gift className="h-3.5 w-3.5" />
                      Redeem
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="w-full" disabled>
                      <Lock className="h-3.5 w-3.5" />
                      Need {reward.cost - availablePoints} more pts
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Redeemed History */}
      {redeemedIds.length > 0 && (
        <Card>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-success-500" />
            Redeemed Rewards
          </CardTitle>
          <CardContent className="mt-4 space-y-2">
            {ALL_REWARDS.filter((r) => redeemedIds.includes(r.id)).map((reward) => (
              <div
                key={reward.id}
                className="flex items-center gap-3 p-3 rounded-[12px] bg-success-50 dark:bg-success-500/5 border border-success-200 dark:border-success-700"
              >
                <span className="text-xl">{reward.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{reward.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">-{reward.cost} points</p>
                </div>
                <Badge variant="success" size="sm">
                  <CheckCircle className="h-3 w-3" />
                  Done
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
