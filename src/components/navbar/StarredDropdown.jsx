import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNav } from '../../context/NavContext';

export default function StarredDropdown() {
  const [open, setOpen] = useState(false);
  const { starredBoards } = useNav();
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
        Starred <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-9 left-0 w-64 bg-[#282E33] border border-white/10 rounded-xl shadow-2xl z-50 p-2"
          >
            <p className="text-xs text-[#8C9BAB] font-semibold uppercase tracking-wider px-2 py-1.5">Starred Boards</p>
            {starredBoards.length === 0 ? (
              <p className="text-xs text-[#8C9BAB] px-2 py-3 text-center">Star a board to find it here</p>
            ) : (
              starredBoards.map(b => (
                <Link
                  key={b.id}
                  to={`/board/${b.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors group"
                >
                  <div className={`w-7 h-5 rounded board-${b.background} flex-shrink-0`} />
                  <span className="text-sm text-[#B6C2CF] group-hover:text-white truncate flex-1">{b.title}</span>
                  <Star size={12} className="text-yellow-400 fill-yellow-400 flex-shrink-0" />
                </Link>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
