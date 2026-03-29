import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import WorkspacesDropdown from './WorkspacesDropdown';
import RecentDropdown from './RecentDropdown';
import StarredDropdown from './StarredDropdown';
import TemplatesDropdown from './TemplatesDropdown';
import NavSearchBar from './NavSearchBar';
import NotificationDropdown from './NotificationDropdown';
import HelpDropdown from './HelpDropdown';
import UserDropdown from './UserDropdown';
import ThemeSwitcher from './ThemeSwitcher';
import * as api from '../../api';
import { useNav } from '../../context/NavContext';
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

export default function Navbar({ onBoardCreated }) {
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle]           = useState('');
  const [bg, setBg]                 = useState('gradient-blue');
  const [creating, setCreating]     = useState(false);
  const { trackRecent } = useNav();
  const navigate = useNavigate();
  const isLight = (bgId) => bgId === 'gradient-white';

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const board = await api.createBoard({ title: title.trim(), background: bg });
      onBoardCreated?.(board);
      trackRecent(board);
      setShowCreate(false);
      setTitle('');
      navigate(`/board/${board.id}`);
    } catch { toast.error('Failed to create board'); }
    finally { setCreating(false); }
  };

  return (
    <>
      <header className="h-12 border-b flex items-center px-3 gap-2 flex-shrink-0 z-30 transition-colors" style={{ background: 'var(--bg-header)', borderColor: 'var(--border)' }}>
        <Link to="/" className="flex items-center gap-1.5 px-2 hover:opacity-90 transition-opacity">
          <span className="text-white font-bold text-lg tracking-tight">Scaler Assignment</span>
        </Link>

        <div className="flex items-center gap-1 ml-2">
          <WorkspacesDropdown />
          <RecentDropdown />
          <StarredDropdown />
          <TemplatesDropdown onBoardCreated={onBoardCreated} />
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors ml-1"
          >
            <Plus size={14} /> Create
          </button>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <NavSearchBar />
          <NotificationDropdown />
          <HelpDropdown />
          <ThemeSwitcher />
          <UserDropdown />
        </div>
      </header>

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
                  <div className="bg-white/20 rounded-lg w-full h-8" />
                  <div className="flex gap-2 w-full">
                    <div className="bg-white/20 rounded-lg flex-1 h-16" />
                    <div className="bg-white/20 rounded-lg flex-1 h-16" />
                    <div className="bg-white/20 rounded-lg flex-1 h-16" />
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
                      title={b.label}
                      className={`board-${b.id} h-10 rounded-lg transition-all relative overflow-hidden
                        ${bg === b.id ? 'ring-2 ring-white ring-offset-2 ring-offset-[#282E33]' : 'hover:opacity-90'}`}
                    >
                      {bg === b.id && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        </div>
                      )}
                    </button>
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
                  {!title.trim() && <p className="text-xs text-[#8C9BAB]">👋 Board title is required</p>}
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
    </>
  );
}
