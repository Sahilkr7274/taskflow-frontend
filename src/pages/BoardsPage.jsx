import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Star, LayoutDashboard, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../api';
import { useNav } from '../context/NavContext';
import toast from 'react-hot-toast';

const BACKGROUNDS = [
  { id: 'gradient-blue',   label: 'Ocean'  },
  { id: 'gradient-purple', label: 'Grape'  },
  { id: 'gradient-green',  label: 'Forest' },
  { id: 'gradient-orange', label: 'Sunset' },
  { id: 'gradient-teal',   label: 'Teal'   },
  { id: 'gradient-red',    label: 'Ruby'   },
  { id: 'gradient-black',  label: 'Black'  },
  { id: 'gradient-white',  label: 'White'  },
];

export default function BoardsPage() {
  const { boards, setBoards } = useOutletContext();
  const { trackRecent, toggleStar, isStarred } = useNav();
  const navigate = useNavigate();
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle]           = useState('');
  const [bg, setBg]                 = useState('gradient-blue');
  const [creating, setCreating]     = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const board = await api.createBoard({ title: title.trim(), background: bg });
      setBoards(prev => [board, ...prev]);
      trackRecent(board);
      setShowCreate(false);
      setTitle('');
      navigate(`/board/${board.id}`);
    } catch { toast.error('Failed to create board'); }
    finally { setCreating(false); }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm('Delete this board and all its data?')) return;
    try {
      await api.deleteBoard(id);
      setBoards(prev => prev.filter(b => b.id !== id));
      toast.success('Board deleted');
    } catch { toast.error('Failed to delete board'); }
  };

  const isLight = (bgId) => bgId === 'gradient-white';

  return (
    <div className="p-8">
      <div className="flex items-center gap-2 mb-6">
        <LayoutDashboard size={18} className="text-[#B6C2CF]" />
        <h1 className="text-[#B6C2CF] font-semibold text-base">Your boards</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
        {boards.map(board => (
          <motion.div key={board.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Link
              to={`/board/${board.id}`}
              onClick={() => trackRecent(board)}
              className="block relative group"
            >
              <div className={`board-${board.background} rounded-xl h-24 p-3 cursor-pointer transition-all hover:brightness-110 hover:shadow-lg hover:shadow-black/30 relative overflow-hidden`}>
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className={`font-semibold text-sm leading-tight relative z-10 ${isLight(board.background) ? 'text-gray-800' : 'text-white'}`}>
                  {board.title}
                </span>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleStar(board); }}
                  className={`absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10
                    ${isStarred(board.id) ? '!opacity-100 text-yellow-400' : 'text-white/70 hover:text-yellow-400'}`}
                >
                  <Star size={14} className={isStarred(board.id) ? 'fill-yellow-400' : ''} />
                </button>
                <button
                  onClick={(e) => handleDelete(e, board.id)}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 hover:bg-black/50 rounded p-1 z-10"
                >
                  <Trash2 size={11} className="text-white" />
                </button>
              </div>
            </Link>
          </motion.div>
        ))}

        <motion.button
          whileHover={{ scale: 1.02 }}
          onClick={() => setShowCreate(true)}
          className="h-24 bg-white/10 hover:bg-white/15 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors text-[#B6C2CF] hover:text-white border border-dashed border-white/20 hover:border-white/40"
        >
          <Plus size={18} />
          <span className="text-sm">Create new board</span>
        </motion.button>
      </div>

      {/* Create Board Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              className="bg-[#282E33] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden relative"
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className={`board-${bg} h-36 flex items-center justify-center relative`}>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                <div className="relative z-10 flex flex-col items-center gap-2 w-full px-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-lg w-full h-8" />
                  <div className="flex gap-2 w-full">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg flex-1 h-16" />
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg flex-1 h-16" />
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg flex-1 h-16" />
                  </div>
                </div>
                <span className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-sm font-semibold ${isLight(bg) ? 'text-gray-800' : 'text-white'}`}>
                  {title || 'Board title'}
                </span>
              </div>
              <div className="p-5">
                <h3 className="text-white font-semibold text-center mb-4">Create board</h3>
                <p className="text-xs text-[#8C9BAB] font-semibold uppercase tracking-wide mb-2">Background</p>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {BACKGROUNDS.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setBg(b.id)}
                      className={`board-${b.id} h-10 rounded-lg transition-all relative overflow-hidden
                        ${bg === b.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#282E33]' : 'hover:opacity-90'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-[#8C9BAB] font-semibold uppercase tracking-wide mb-1.5">Board title <span className="text-red-400">*</span></p>
                <form onSubmit={handleCreate} className="space-y-3">
                  <input
                    autoFocus
                    className="w-full bg-[#22272B] border border-white/20 text-white placeholder-[#8C9BAB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="e.g. My awesome board"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={!title.trim() || creating}
                    className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-[#3D4B58] disabled:text-[#8C9BAB] disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg text-sm transition-colors"
                  >
                    {creating ? 'Creating…' : 'Create'}
                  </button>
                </form>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="absolute top-3 right-3 text-white/60 hover:text-white hover:bg-white/10 rounded-full p-1.5 transition-colors"
              >
                <X size={16} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
