import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, LayoutDashboard, Home as HomeIcon,
  Users, ChevronDown, X, Star, Clock, Search, Bell, HelpCircle
} from 'lucide-react';
import * as api from '../api';
import toast from 'react-hot-toast';
import TEMPLATES from '../data/templates.js';

const BACKGROUNDS = [
  { id: 'gradient-blue',   label: 'Ocean',  },
  { id: 'gradient-purple', label: 'Grape',  },
  { id: 'gradient-green',  label: 'Forest', },
  { id: 'gradient-orange', label: 'Sunset', },
  { id: 'gradient-teal',   label: 'Teal',   },
  { id: 'gradient-red',    label: 'Ruby',   },
  { id: 'gradient-black',  label: 'Black',  },
  { id: 'gradient-white',  label: 'White',  },
];

export default function Home() {
  const [boards, setBoards] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [title, setTitle] = useState('');
  const [bg, setBg] = useState('gradient-blue');
  const [creating, setCreating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getBoards().then(setBoards).catch(() => toast.error('Failed to load boards'));
  }, []);

  const openCreate = (templateBg) => {
    setBg(templateBg || 'gradient-blue');
    setTitle('');
    setShowTemplates(false);
    setShowCreate(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setCreating(true);
    try {
      const board = await api.createBoard({ title: title.trim(), background: bg });
      setBoards(prev => [board, ...prev]);
      setShowCreate(false);
      navigate(`/board/${board.id}`);
    } catch { toast.error('Failed to create board'); }
    finally { setCreating(false); }
  };

  const handleTemplate = async (tpl) => {
    const name = tpl.name;
    setCreating(true);
    try {
      const board = await api.createBoardFromTemplate({
        title: name,
        background: tpl.background,
        lists: tpl.lists,
      });
      setBoards(prev => [board, ...prev]);
      setShowTemplates(false);
      navigate(`/board/${board.id}`);
      toast.success(`"${name}" board created!`);
    } catch { toast.error('Failed to create from template'); }
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
    <div className="min-h-screen flex flex-col bg-[#1D2125]">

      {/* ── Top Header ── */}
      <header className="h-12 bg-[#1D2125] border-b border-white/10 flex items-center px-3 gap-2 flex-shrink-0 z-30">
        {/* Logo */}
        <div className="flex items-center gap-1.5 px-2">
          <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
            <LayoutDashboard size={14} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Taskflow</span>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-1 ml-2">
          {['Workspaces', 'Recent', 'Starred', 'Templates'].map(label => (
            <button key={label} className="flex items-center gap-1 text-[#B6C2CF] hover:bg-white/10 hover:text-white px-3 py-1.5 rounded text-sm transition-colors">
              {label} <ChevronDown size={12} />
            </button>
          ))}
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors ml-1"
          >
            <Plus size={14} /> Create
          </button>
        </div>

        {/* Right side */}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#B6C2CF]" />
            <input
              className="bg-[#2C333A] border border-white/20 text-[#B6C2CF] placeholder-[#B6C2CF]/60 rounded pl-8 pr-3 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-400 focus:text-white transition-all"
              placeholder="Search…"
            />
          </div>
          <button className="w-8 h-8 flex items-center justify-center text-[#B6C2CF] hover:bg-white/10 rounded-full transition-colors">
            <Bell size={16} />
          </button>
          <button className="w-8 h-8 flex items-center justify-center text-[#B6C2CF] hover:bg-white/10 rounded-full transition-colors">
            <HelpCircle size={16} />
          </button>
          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:opacity-90">
            A
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Left Sidebar ── */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} flex-shrink-0 bg-[#1D2125] border-r border-white/10 overflow-y-auto transition-all duration-200`}>
          <div className="p-2 space-y-0.5">
            {[
              { icon: <HomeIcon size={16} />, label: 'Home' },
              { icon: <LayoutDashboard size={16} />, label: 'Boards', active: true },
              { icon: <Users size={16} />, label: 'Members' },
            ].map(item => (
              <button
                key={item.label}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
                  ${item.active ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-[#B6C2CF] hover:bg-white/10 hover:text-white'}`}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          <div className="px-3 pt-4 pb-2">
            <p className="text-xs font-semibold text-[#8C9BAB] uppercase tracking-wider mb-2">Workspaces</p>
            <div className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/10 cursor-pointer group">
              <div className="w-7 h-7 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">T</div>
              <span className="text-sm text-[#B6C2CF] group-hover:text-white flex-1">Taskflow Workspace</span>
              <ChevronDown size={12} className="text-[#8C9BAB]" />
            </div>
          </div>

          <div className="px-3 pt-2 pb-2 space-y-0.5">
            {[
              { icon: <LayoutDashboard size={14} />, label: 'Boards' },
              { icon: <Users size={14} />, label: 'Members' },
              { icon: <Star size={14} />, label: 'Highlights' },
            ].map(item => (
              <button key={item.label} className="w-full flex items-center gap-3 px-3 py-1.5 rounded text-sm text-[#B6C2CF] hover:bg-white/10 hover:text-white transition-colors">
                {item.icon} {item.label}
              </button>
            ))}
          </div>

          <div className="px-3 pt-4">
            <p className="text-xs font-semibold text-[#8C9BAB] uppercase tracking-wider mb-2">Recent</p>
            {boards.slice(0, 5).map(b => (
              <Link key={b.id} to={`/board/${b.id}`} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 group">
                <div className={`w-6 h-5 rounded board-${b.background} flex-shrink-0`} />
                <span className="text-sm text-[#B6C2CF] group-hover:text-white truncate">{b.title}</span>
              </Link>
            ))}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-y-auto bg-[#1D2125] p-8">

          {/* Your Boards */}
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-5">
              <LayoutDashboard size={18} className="text-[#B6C2CF]" />
              <h2 className="text-[#B6C2CF] font-semibold text-base">Your boards</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {boards.map(board => (
                <motion.div key={board.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  <Link to={`/board/${board.id}`} className="block relative group">
                    <div className={`board-${board.background} rounded-xl h-24 p-3 cursor-pointer transition-all hover:brightness-110 hover:shadow-lg hover:shadow-black/30 relative overflow-hidden`}>
                      {/* Shine overlay */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className={`font-semibold text-sm leading-tight relative z-10 ${isLight(board.background) ? 'text-gray-800' : 'text-white'}`}>
                        {board.title}
                      </span>
                      {/* Star */}
                      <button className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-white/70 hover:text-yellow-400 z-10">
                        <Star size={14} />
                      </button>
                      {/* Delete */}
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

              {/* Create new board tile */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={() => setShowCreate(true)}
                className="h-24 bg-white/10 hover:bg-white/15 rounded-xl flex flex-col items-center justify-center gap-1.5 transition-colors text-[#B6C2CF] hover:text-white border border-dashed border-white/20 hover:border-white/40"
              >
                <Plus size={18} />
                <span className="text-sm">Create new board</span>
              </motion.button>
            </div>
          </section>

          {/* Templates section */}
          <section>
            <div className="flex items-center gap-2 mb-5">
              <Clock size={18} className="text-[#B6C2CF]" />
              <h2 className="text-[#B6C2CF] font-semibold text-base">Start with a template</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
              {TEMPLATES.map(tpl => (
                <motion.button
                  key={tpl.name}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => { setShowTemplates(true); }}
                  className="text-left"
                >
                  <div className={`board-${tpl.background} rounded-xl h-24 p-3 cursor-pointer hover:brightness-110 hover:shadow-lg hover:shadow-black/30 transition-all relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-black/20" />
                    <div className="relative z-10">
                      <span className="text-lg">{tpl.icon}</span>
                      <p className="text-white font-semibold text-sm mt-1 leading-tight">{tpl.name}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>
        </main>
      </div>

      {/* ── Create Board Modal ── */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              className="bg-[#282E33] rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              {/* Preview */}
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

                {/* Background picker */}
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

                {/* Title input */}
                <p className="text-xs text-[#8C9BAB] font-semibold uppercase tracking-wide mb-1.5">Board title <span className="text-red-400">*</span></p>
                <form onSubmit={handleCreate} className="space-y-3">
                  <input
                    autoFocus
                    className="w-full bg-[#22272B] border border-white/20 text-white placeholder-[#8C9BAB] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 transition-colors"
                    placeholder="e.g. My awesome board"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                  />
                  {!title.trim() && (
                    <p className="text-xs text-[#8C9BAB]">👋 Board title is required</p>
                  )}
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

      {/* ── Templates Modal ── */}
      <AnimatePresence>
        {showTemplates && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowTemplates(false)}
          >
            <motion.div
              className="bg-[#282E33] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-white font-semibold text-lg">Choose a template</h3>
                  <button onClick={() => setShowTemplates(false)} className="text-[#8C9BAB] hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {TEMPLATES.map(tpl => (
                    <motion.button
                      key={tpl.name}
                      whileHover={{ x: 4 }}
                      onClick={() => handleTemplate(tpl)}
                      disabled={creating}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-white/10 transition-colors text-left group"
                    >
                      <div className={`board-${tpl.background} w-14 h-10 rounded-lg flex-shrink-0 flex items-center justify-center text-xl`}>
                        {tpl.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{tpl.name}</p>
                        <p className="text-[#8C9BAB] text-xs mt-0.5">{tpl.desc}</p>
                        <div className="flex gap-1 mt-1.5 flex-wrap">
                          {tpl.lists.map(l => (
                            <span key={l.title} className="text-xs bg-white/10 text-[#B6C2CF] px-2 py-0.5 rounded-full">{l.title}</span>
                          ))}
                        </div>
                      </div>
                      <span className="text-[#8C9BAB] group-hover:text-white text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                        Use →
                      </span>
                    </motion.button>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <button
                    onClick={() => { setShowTemplates(false); setShowCreate(true); }}
                    className="w-full text-[#B6C2CF] hover:text-white text-sm py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    + Create a blank board instead
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
