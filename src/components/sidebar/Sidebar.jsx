import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home as HomeIcon, LayoutDashboard, Users, ChevronDown, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNav } from '../../context/NavContext';

export default function Sidebar({ boards = [] }) {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    workspaces, currentWorkspace, setCurrentWorkspace,
    workspaceExpanded, setWorkspaceExpanded,
    recentBoards,
  } = useNav();

  const wsId = currentWorkspace.id;
  const path = location.pathname;
  const isActive = (href) => path === href;

  const topNavItems = [
    { icon: <HomeIcon size={16} />,        label: 'Home',    href: '/' },
    { icon: <LayoutDashboard size={16} />, label: 'Boards',  href: '/boards' },
    { icon: <Users size={16} />,           label: 'Members', href: '/members' },
  ];

  const wsNavItems = [
    { icon: <LayoutDashboard size={14} />, label: 'Boards',     href: `/workspace/${wsId}/boards` },
    { icon: <Users size={14} />,           label: 'Members',    href: `/workspace/${wsId}/members` },
    { icon: <Star size={14} />,            label: 'Highlights', href: `/workspace/${wsId}/highlights` },
  ];

  const handleWorkspaceSwitch = (ws) => {
    setCurrentWorkspace(ws);
    const match = path.match(/\/workspace\/[^/]+\/(boards|members|highlights)/);
    if (match) navigate(`/workspace/${ws.id}/${match[1]}`);
  };

  const displayRecent = recentBoards.length > 0 ? recentBoards : boards;

  return (
    <aside className="w-64 flex-shrink-0 border-r overflow-y-auto transition-colors" style={{ background: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>

      {/* Top nav */}
      <div className="p-2 space-y-0.5">
        {topNavItems.map(item => (
          <Link
            key={item.label}
            to={item.href}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors
              ${isActive(item.href)
                ? 'bg-blue-600/20 text-blue-400 font-medium'
                : 'text-[#B6C2CF] hover:bg-white/10 hover:text-white'}`}
          >
            {item.icon} {item.label}
          </Link>
        ))}
      </div>

      {/* Workspace header */}
      <div className="px-3 pt-4 pb-2">
        <p className="text-xs font-semibold text-[#8C9BAB] uppercase tracking-wider mb-2">Workspaces</p>
        <div className="relative group/ws">
          <button
            onClick={() => setWorkspaceExpanded(v => !v)}
            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <div className={`w-7 h-7 rounded bg-gradient-to-br ${currentWorkspace.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              {currentWorkspace.initial}
            </div>
            <span className="text-sm text-[#B6C2CF] group-hover/ws:text-white flex-1 text-left truncate">
              {currentWorkspace.name}
            </span>
            <ChevronDown
              size={12}
              className={`text-[#8C9BAB] transition-transform flex-shrink-0 ${workspaceExpanded ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Workspace switcher dropdown */}
          {workspaces.length > 1 && (
            <div className="hidden group-hover/ws:block absolute left-0 top-full w-full bg-[#282E33] border border-white/10 rounded-xl shadow-2xl z-20 py-1 mt-1">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => handleWorkspaceSwitch(ws)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors hover:bg-white/10
                    ${currentWorkspace.id === ws.id ? 'text-blue-400' : 'text-[#B6C2CF] hover:text-white'}`}
                >
                  <div className={`w-5 h-5 rounded bg-gradient-to-br ${ws.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                    {ws.initial}
                  </div>
                  <span className="truncate">{ws.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Workspace sub-nav with collapse animation */}
      <AnimatePresence initial={false}>
        {workspaceExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-2 space-y-0.5">
              {wsNavItems.map(item => (
                <Link
                  key={item.label}
                  to={item.href}
                  className={`w-full flex items-center gap-3 px-3 py-1.5 rounded text-sm transition-colors
                    ${isActive(item.href)
                      ? 'bg-blue-600/20 text-blue-400 font-medium'
                      : 'text-[#B6C2CF] hover:bg-white/10 hover:text-white'}`}
                >
                  {item.icon} {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recent boards */}
      {displayRecent.length > 0 && (
        <div className="px-3 pt-4">
          <p className="text-xs font-semibold text-[#8C9BAB] uppercase tracking-wider mb-2">Recent</p>
          {displayRecent.slice(0, 5).map(b => (
            <Link
              key={b.id}
              to={`/board/${b.id}`}
              className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/10 group"
            >
              <div className={`w-6 h-5 rounded board-${b.background} flex-shrink-0`} />
              <span className="text-sm text-[#B6C2CF] group-hover:text-white truncate">{b.title}</span>
            </Link>
          ))}
        </div>
      )}
    </aside>
  );
}
