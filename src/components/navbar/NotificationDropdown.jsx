import { useState } from 'react';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

const DUMMY_NOTIFICATIONS = [
  { id: 1, icon: '🔀', text: 'Card "Build auth system" was moved to Done', time: '2m ago', unread: true },
  { id: 2, icon: '👤', text: 'Sara Lee was assigned to "Dashboard UI"', time: '15m ago', unread: true },
  { id: 3, icon: '✅', text: 'Mike Chen completed "Setup CI/CD"', time: '1h ago', unread: false },
  { id: 4, icon: '🏷️', text: 'Label "Urgent" added to "Fix payment bug"', time: '3h ago', unread: false },
  { id: 5, icon: '💬', text: 'New card "Mobile responsive fixes" created', time: '1d ago', unread: false },
];

export default function NotificationDropdown() {
  const [open, setOpen]         = useState(false);
  const [notifications, setNotifications] = useState(DUMMY_NOTIFICATIONS);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 flex items-center justify-center text-[#B6C2CF] hover:bg-white/10 rounded-full transition-colors relative"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-10 right-0 w-80 bg-[#282E33] border border-white/10 rounded-xl shadow-2xl z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-white font-semibold text-sm">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto py-1">
              {notifications.map(n => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-white/5 transition-colors cursor-default ${n.unread ? 'bg-blue-500/5' : ''}`}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">{n.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-relaxed ${n.unread ? 'text-white' : 'text-[#B6C2CF]'}`}>{n.text}</p>
                    <p className="text-[10px] text-[#8C9BAB] mt-0.5">{n.time}</p>
                  </div>
                  {n.unread && <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
