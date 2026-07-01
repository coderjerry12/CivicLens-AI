import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Firestore document structure for user points:
 * Collection: userPoints/{uid}
 * {
 *   bonusPoints: number,      // Points from quizzes, challenges, etc.
 *   spentPoints: number,      // Points spent on rewards
 *   redeemedIds: string[],    // IDs of redeemed rewards
 *   quizHistory: { date: string, score: number, total: number, pointsEarned: number }[],
 *   challengesClaimed: string[],  // IDs of claimed challenges
 *   lastUpdated: string
 * }
 */

export interface UserPointsData {
  bonusPoints: number;
  spentPoints: number;
  redeemedIds: string[];
  quizHistory: { date: string; score: number; total: number; pointsEarned: number }[];
  challengesClaimed: string[];
  lastUpdated: string;
}

const DEFAULT_DATA: UserPointsData = {
  bonusPoints: 0,
  spentPoints: 0,
  redeemedIds: [],
  quizHistory: [],
  challengesClaimed: [],
  lastUpdated: new Date().toISOString(),
};

/**
 * Load user points data from Firestore.
 */
export async function loadUserPoints(uid: string): Promise<UserPointsData> {
  try {
    const docRef = doc(db, 'userPoints', uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_DATA, ...snap.data() } as UserPointsData;
    }
    return { ...DEFAULT_DATA };
  } catch (err) {
    console.error('[PointsService] Load failed:', err);
    return { ...DEFAULT_DATA };
  }
}

/**
 * Save user points data to Firestore.
 */
export async function saveUserPoints(uid: string, data: UserPointsData): Promise<void> {
  try {
    const docRef = doc(db, 'userPoints', uid);
    await setDoc(docRef, { ...data, lastUpdated: new Date().toISOString() });
  } catch (err) {
    console.error('[PointsService] Save failed:', err);
    throw err;
  }
}

/**
 * Add bonus points (from quiz, challenge, etc.)
 */
export async function addBonusPoints(uid: string, points: number, _source?: string): Promise<UserPointsData> {
  const data = await loadUserPoints(uid);
  data.bonusPoints += points;
  await saveUserPoints(uid, data);
  return data;
}

/**
 * Spend points on a reward.
 */
export async function spendPoints(uid: string, rewardId: string, cost: number): Promise<UserPointsData> {
  const data = await loadUserPoints(uid);
  if (data.redeemedIds.includes(rewardId)) {
    return data; // Already redeemed
  }
  data.spentPoints += cost;
  data.redeemedIds.push(rewardId);
  await saveUserPoints(uid, data);
  return data;
}

/**
 * Record a quiz result and award points.
 */
export async function recordQuizResult(
  uid: string,
  score: number,
  total: number
): Promise<{ data: UserPointsData; pointsEarned: number }> {
  const pointsEarned = Math.round((score / total) * 20);
  const data = await loadUserPoints(uid);
  data.bonusPoints += pointsEarned;
  data.quizHistory.push({
    date: new Date().toISOString(),
    score,
    total,
    pointsEarned,
  });
  await saveUserPoints(uid, data);
  return { data, pointsEarned };
}

/**
 * Claim a challenge reward.
 */
export async function claimChallenge(uid: string, challengeId: string, reward: number): Promise<UserPointsData> {
  const data = await loadUserPoints(uid);
  if (data.challengesClaimed.includes(challengeId)) {
    return data; // Already claimed
  }
  data.bonusPoints += reward;
  data.challengesClaimed.push(challengeId);
  await saveUserPoints(uid, data);
  return data;
}
