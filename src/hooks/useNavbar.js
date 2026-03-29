import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEYS = {
  recent: 'tf_recent_boards',
  starred: 'tf_starred_boards',
};

const MAX_RECENT = 8;

export function useNavbar(boards) {
  const [recentBoards, setRecentBoards] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.recent)) || []; }
    catch { return []; }
  });

  const [starredIds, setStarredIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEYS.starred)) || []; }
    catch { return []; }
  });

  // Sync starred/recent to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.recent, JSON.stringify(recentBoards));
  }, [recentBoards]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.starred, JSON.stringify(starredIds));
  }, [starredIds]);

  const trackRecent = useCallback((board) => {
    setRecentBoards(prev => {
      const filtered = prev.filter(b => b.id !== board.id);
      return [{ id: board.id, title: board.title, background: board.background }, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const toggleStar = useCallback((e, boardId) => {
    e.preventDefault();
    e.stopPropagation();
    setStarredIds(prev =>
      prev.includes(boardId) ? prev.filter(id => id !== boardId) : [...prev, boardId]
    );
  }, []);

  const isStarred = useCallback((boardId) => starredIds.includes(boardId), [starredIds]);

  const starredBoards = boards.filter(b => starredIds.includes(b.id));

  return { recentBoards, starredBoards, trackRecent, toggleStar, isStarred };
}
