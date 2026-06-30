import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, orderBy, serverTimestamp, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Comment, CommentInput } from '@/types/community';

/**
 * Fetches all comments for an issue.
 */
export async function fetchComments(issueId: string): Promise<Comment[]> {
  const commentsRef = collection(db, 'issues', issueId, 'comments');
  const q = query(commentsRef, orderBy('createdAt', 'asc'));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    issueId,
    authorId: d.data().authorId || '',
    authorName: d.data().authorName || 'Anonymous',
    authorRole: d.data().authorRole || 'citizen',
    content: d.data().content || '',
    parentId: d.data().parentId || null,
    helpful: d.data().helpful || 0,
    createdAt: d.data().createdAt?.toDate?.() || new Date(),
    updatedAt: d.data().updatedAt?.toDate?.() || new Date(),
  }));
}

/**
 * Adds a new comment or reply.
 */
export async function addComment(
  issueId: string,
  input: CommentInput,
  authorId: string,
  authorName: string,
  authorRole: string
): Promise<string> {
  const commentsRef = collection(db, 'issues', issueId, 'comments');

  const docRef = await addDoc(commentsRef, {
    authorId,
    authorName,
    authorRole,
    content: input.content,
    parentId: input.parentId || null,
    helpful: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Increment comment count on issue
  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, { commentCount: increment(1) });

  return docRef.id;
}

/**
 * Edits an existing comment.
 */
export async function editComment(issueId: string, commentId: string, content: string): Promise<void> {
  const commentRef = doc(db, 'issues', issueId, 'comments', commentId);
  await updateDoc(commentRef, { content, updatedAt: serverTimestamp() });
}

/**
 * Deletes a comment.
 */
export async function deleteComment(issueId: string, commentId: string): Promise<void> {
  const commentRef = doc(db, 'issues', issueId, 'comments', commentId);
  await deleteDoc(commentRef);

  const issueRef = doc(db, 'issues', issueId);
  await updateDoc(issueRef, { commentCount: increment(-1) });
}
