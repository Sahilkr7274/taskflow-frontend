import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../navbar/Navbar';
import Sidebar from '../sidebar/Sidebar';
import * as api from '../../api';
import { useNav } from '../../context/NavContext';
import toast from 'react-hot-toast';

export default function AppLayout() {
  const [boards, setBoards] = useState([]);
  const { trackRecent } = useNav();

  useEffect(() => {
    api.getBoards().then(setBoards).catch(() => toast.error('Failed to load boards'));
  }, []);

  const handleBoardCreated = (board) => {
    setBoards(prev => [board, ...prev]);
    trackRecent(board);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-app)' }}>
      <Navbar onBoardCreated={handleBoardCreated} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar boards={boards} />
        <main className="flex-1 overflow-y-auto" style={{ background: 'var(--bg-main)' }}>
          <Outlet context={{ boards, setBoards }} />
        </main>
      </div>
    </div>
  );
}
