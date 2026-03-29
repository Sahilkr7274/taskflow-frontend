import { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNav } from '../../context/NavContext';

export default function WorkspacesDropdown() {
  const [open, setOpen] = useState(false);
  const { workspaces, currentWorkspace, setCurrentWorkspace } = useNav();
  const ref = useRef(null);

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
        className="flex items-center gap-1 text-[#B6C2CF] hover:bg-white/10 hover:text-white px-3 py-1.5 rounded text-sm transition-colors"
      >
        Workspaces <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-9 left-0 w-64 bg-[#282E33] border border-white/10 rounded-xl shadow-2xl z-50 p-2"
          >
            <p className="text-xs text-[#8C9BAB] font-semibold uppercase tracking-wider px-2 py-1.5">Your Workspaces</p>
            {workspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => { setCurrentWorkspace(ws); setOpen(false); }}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <div className={`w-7 h-7 rounded bg-gradient-to-br ${ws.color} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                  {ws.initial}
                </div>
                <span className="text-sm text-[#B6C2CF] group-hover:text-white flex-1 text-left">{ws.name}</span>
                {currentWorkspace.id === ws.id && <Check size={14} className="text-blue-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
