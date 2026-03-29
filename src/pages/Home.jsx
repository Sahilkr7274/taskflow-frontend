import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutDashboard, Trash2, Layout } from 'lucide-react';
import * as api from '../api';
import toast from 'react-hot-toast';

const BACKGROUNDS = [
  { id: 'gradient-blue', label: 'Ocean' },
  { id: 'gradient-purple', label: 'Grape' },
  { id: 'gradient-green', label: 'Forest' },
  { id: 'gradient-orange', label: 'Sunset' },
  { id: 'gradient-teal', label: 'Teal' },
  { id: 'gradient-red', label: 'Ruby' },
  { id: 'gradient-black', label: 'Black' },
  { id: 'gradient-white', label: 'White' },
];

export default function Home() {
  const [boards, setBoards] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [bg, setBg] = useState('gradient-blue');
  const navigate = useNavigate();

  useEffect(() => {
    api.getBoards().then(setBoards).catch(() => toast.error('Failed to load boards'));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const board = await api.createBoard({ title: title.trim(), background: bg });
      setBoards(prev => [board, ...prev]);
      setTitle('');
      setShowCreate(false);
      navigate(`/board/${board.id}`);
    } catch {
      toast.error('Failed to create board');
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this board?')) return;
    try {
      await api.deleteBoard(id);
      setBoards(prev => prev.filter(b => b.id !== id));
      toast.success('Board deleted');
    } catch {
      toast.error('Failed to delete board');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#026AA7] shadow-md px-6 py-3 flex items-center gap-3">
        <LayoutDashboard className="text-white" size={24} />
        <span className="text-white font-bold text-xl">Taskflow</span>
        <div className="ml-auto flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">A</div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <Layout size={20} className="text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-700">Your Boards</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {boards.map(board => (
            <motion.div key={board.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Link to={`/board/${board.id}`} className="block relative group">
                <div className={`board-${board.background} rounded-lg h-24 p-3 flex flex-col justify-between cursor-pointer hover:brightness-110 transition-all border border-gray-200/30`}>
                  <span className={`font-semibold text-sm leading-tight ${board.background === 'gradient-white' ? 'text-gray-800' : 'text-white'}`}>
                    {board.title}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, board.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 hover:bg-black/40 rounded p-1"
                  >
                    <Trash2 size={12} className="text-white" />
                  </button>
                </div>
              </Link>
            </motion.div>
          ))}

          {/* Create Board Button */}
          <motion.div whileHover={{ scale: 1.02 }}>
            <button
              onClick={() => setShowCreate(true)}
              className="w-full h-24 bg-gray-200 hover:bg-gray-300 rounded-lg flex flex-col items-center justify-center gap-1 transition-colors text-gray-600"
            >
              <Plus size={20} />
              <span className="text-sm">Create board</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Create Board Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-modal w-full max-w-sm p-6"
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="font-bold text-lg mb-4">Create Board</h3>

              {/* Background Preview */}
              <div className={`board-${bg} rounded-lg h-20 mb-4 flex items-center justify-center border border-gray-200`}>
                <span className={`font-semibold ${bg === 'gradient-white' ? 'text-gray-800' : 'text-white'}`}>
                  {title || 'Board Title'}
                </span>
              </div>

              {/* Background Picker */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {BACKGROUNDS.map(b => (
                  <button
                    key={b.id}
                    onClick={() => setBg(b.id)}
                    className={`board-${b.id} w-10 h-8 rounded cursor-pointer transition-all ${bg === b.id ? 'ring-2 ring-offset-1 ring-blue-500 scale-110' : ''}`}
                    title={b.label}
                  />
                ))}
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <input
                  autoFocus
                  className="input-base"
                  placeholder="Board title"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary flex-1" disabled={!title.trim()}>
                    Create
                  </button>
                  <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm hover:bg-gray-50">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
