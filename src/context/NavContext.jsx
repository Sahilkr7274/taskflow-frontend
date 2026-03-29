import { createContext, useContext, useState, useCallback } from 'react';

const NavContext = createContext(null);

export const WORKSPACES = [
  { id: 'ws-1', name: 'Scaler Workspace', initial: 'S', color: 'from-blue-500 to-purple-600' },
  { id: 'ws-2', name: 'Personal Workspace', initial: 'P', color: 'from-green-500 to-teal-600' },
  { id: 'ws-3', name: 'Team Workspace',     initial: 'T', color: 'from-orange-500 to-red-600' },
];

const load = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const save = (key, val) => localStorage.setItem(key, JSON.stringify(val));

export const NavProvider = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState(WORKSPACES[0]);
  const [workspaceExpanded, setWorkspaceExpanded] = useState(true);
  const [recentBoards,  setRecentBoards]  = useState(() => load('tf_recent',  []));
  const [starredBoards, setStarredBoards] = useState(() => load('tf_starred', []));

  const trackRecent = useCallback((board) => {
    setRecentBoards(prev => {
      const next = [board, ...prev.filter(b => b.id !== board.id)].slice(0, 8);
      save('tf_recent', next);
      return next;
    });
  }, []);

  const toggleStar = useCallback((board) => {
    setStarredBoards(prev => {
      const isStarred = prev.some(b => b.id === board.id);
      const next = isStarred ? prev.filter(b => b.id !== board.id) : [board, ...prev];
      save('tf_starred', next);
      return next;
    });
  }, []);

  const isStarred = useCallback((id) => starredBoards.some(b => b.id === id), [starredBoards]);

  return (
    <NavContext.Provider value={{
      workspaces: WORKSPACES,
      currentWorkspace, setCurrentWorkspace,
      workspaceExpanded, setWorkspaceExpanded,
      recentBoards,  trackRecent,
      starredBoards, toggleStar, isStarred,
    }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);
