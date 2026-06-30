import { useState, useEffect, useCallback } from 'react';
import { fetchComments, addComment, editComment, deleteComment } from '@/services/commentService';
import { useAuth } from '@/features/auth';
import type { Comment } from '@/types/community';

export function useComments(issueId: string) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchComments(issueId);
      setComments(data);
    } catch { /* silent */ }
    setLoading(false);
  }, [issueId]);

  useEffect(() => { fetch(); }, [fetch]);

  const add = useCallback(async (content: string, parentId?: string) => {
    if (!user) return;
    await addComment(issueId, { content, parentId }, user.uid, user.displayName || 'User', user.role);
    await fetch();
  }, [issueId, user, fetch]);

  const edit = useCallback(async (commentId: string, content: string) => {
    await editComment(issueId, commentId, content);
    await fetch();
  }, [issueId, fetch]);

  const remove = useCallback(async (commentId: string) => {
    await deleteComment(issueId, commentId);
    await fetch();
  }, [issueId, fetch]);

  const topLevel = comments.filter((c) => !c.parentId);
  const getReplies = (parentId: string) => comments.filter((c) => c.parentId === parentId);

  return { comments: topLevel, getReplies, loading, add, edit, remove, refresh: fetch };
}
