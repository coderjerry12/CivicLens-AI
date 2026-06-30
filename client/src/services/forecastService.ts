import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Predictive forecasting using rule-based analysis of historical data.
 * Designed to be replaceable by Gemini in the future.
 */

export interface Forecast {
  id: string;
  type: 'category_trend' | 'workload' | 'hotspot' | 'sla_risk';
  title: string;
  description: string;
  prediction: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
}

export async function generateForecasts(): Promise<Forecast[]> {
  const snapshot = await getDocs(collection(db, 'issues'));
  const forecasts: Forecast[] = [];

  const issues: { category: string; severity: string; status: string; department: string; createdAt: Date }[] = [];
  snapshot.forEach((doc) => {
    const d = doc.data();
    issues.push({
      category: d.category || 'other',
      severity: d.severity || 'medium',
      status: d.status || 'pending',
      department: d.department || 'general',
      createdAt: d.createdAt?.toDate?.() || new Date(),
    });
  });

  if (issues.length < 2) return [];

  // Category trend forecast
  const recentWeek = issues.filter((i) => Date.now() - i.createdAt.getTime() < 7 * 86400000);
  const catCounts: Record<string, number> = {};
  recentWeek.forEach((i) => { catCounts[i.category] = (catCounts[i.category] || 0) + 1; });
  const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];

  if (topCat) {
    forecasts.push({
      id: 'fc-cat',
      type: 'category_trend',
      title: `${topCat[0].replace('_', ' ')} Reports Rising`,
      description: `${topCat[1]} reports this week. Likely to continue increasing based on pattern.`,
      prediction: `Expected +${Math.round(topCat[1] * 0.3)} next week`,
      confidence: 72,
      trend: 'up',
    });
  }

  // Department workload forecast
  const deptCounts: Record<string, number> = {};
  issues.filter((i) => i.status !== 'resolved').forEach((i) => { deptCounts[i.department] = (deptCounts[i.department] || 0) + 1; });
  const busiestDept = Object.entries(deptCounts).sort((a, b) => b[1] - a[1])[0];

  if (busiestDept && busiestDept[1] > 2) {
    forecasts.push({
      id: 'fc-dept',
      type: 'workload',
      title: `${busiestDept[0].replace('_', ' ')} Nearing Capacity`,
      description: `${busiestDept[1]} active issues. May need additional resources.`,
      prediction: 'Backlog risk within 48h',
      confidence: 68,
      trend: 'up',
    });
  }

  // SLA risk
  const pendingOld = issues.filter((i) =>
    (i.status === 'pending' || i.status === 'assigned') &&
    Date.now() - i.createdAt.getTime() > 36 * 3600000
  );

  if (pendingOld.length > 0) {
    forecasts.push({
      id: 'fc-sla',
      type: 'sla_risk',
      title: `${pendingOld.length} Issues Approaching SLA Breach`,
      description: 'These issues have been pending over 36 hours without resolution.',
      prediction: `${pendingOld.length} breaches within 12h`,
      confidence: 85,
      trend: 'up',
    });
  }

  // Positive forecast
  const resolvedRecent = issues.filter((i) =>
    i.status === 'resolved' && Date.now() - i.createdAt.getTime() < 7 * 86400000
  ).length;

  if (resolvedRecent > recentWeek.length * 0.5) {
    forecasts.push({
      id: 'fc-positive',
      type: 'category_trend',
      title: 'Resolution Rate Improving',
      description: 'More issues resolved than created this week.',
      prediction: 'Backlog will decrease',
      confidence: 75,
      trend: 'down',
    });
  }

  return forecasts;
}
