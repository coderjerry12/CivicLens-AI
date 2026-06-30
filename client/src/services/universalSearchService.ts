import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface SearchResult {
  id: string;
  type: 'issue' | 'user' | 'department';
  title: string;
  subtitle: string;
  route: string;
}

/**
 * Searches across all issues for instant results.
 */
export async function universalSearch(query: string): Promise<SearchResult[]> {
  if (!query.trim() || query.length < 2) return [];

  const q = query.toLowerCase();
  const snapshot = await getDocs(collection(db, 'issues'));
  const results: SearchResult[] = [];

  snapshot.forEach((doc) => {
    const d = doc.data();
    const searchable = [
      d.trackingId, d.title, d.description, d.category,
      d.department, d.location?.address, d.reporter?.name,
    ].filter(Boolean).join(' ').toLowerCase();

    if (searchable.includes(q)) {
      results.push({
        id: doc.id,
        type: 'issue',
        title: d.title || 'Untitled',
        subtitle: `${d.trackingId || ''} • ${d.category?.replace('_', ' ') || ''} • ${d.status || ''}`,
        route: `/app/issues/${doc.id}`,
      });
    }
  });

  return results.slice(0, 8);
}
