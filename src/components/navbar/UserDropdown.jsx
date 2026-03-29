import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_USER = { name: 'Alex Johnson', email: 'alex@example.com', avatarColor: '#16a34a' };

export default function UserDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const user = DEFAULT_USER;
  const initials = user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:opacity-90 transition-opacity ring-2 ring-transparent hover:ring-white/30"
        style={{ backgroundColor: user.avatarColor }}
        title={user.name}
      >
        {initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-10 right-0 w-56 bg-[#282E33] border border-white/10 rounded-xl shadow-2xl z-50"
          >
            {/* User info */}
            <div className="px-4 py-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ backgroundColor: user.avatarColor }}
                >
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-medium truncate">{user.name}</p>
                  <p className="text-[#8C9BAB] text-xs truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left group"
              >
                <User size={14} className="text-[#8C9BAB] group-hover:text-white" />
                <span className="text-sm text-[#B6C2CF] group-hover:text-white">Profile</span>
                <span className="ml-auto text-[10px] text-[#8C9BAB] bg-white/10 px-1.5 py-0.5 rounded">Soon</span>
              </button>
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors text-left group"
              >
                <Settings size={14} className="text-[#8C9BAB] group-hover:text-white" />
                <span className="text-sm text-[#B6C2CF] group-hover:text-white">Settings</span>
                <span className="ml-auto text-[10px] text-[#8C9BAB] bg-white/10 px-1.5 py-0.5 rounded">Soon</span>
              </button>
            </div>

            <div className="border-t border-white/10 py-1">
              <button
                onClick={() => setOpen(false)}
                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-left group"
              >
                <LogOut size={14} className="text-[#8C9BAB] group-hover:text-red-400" />
                <span className="text-sm text-[#B6C2CF] group-hover:text-red-400">Log out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
