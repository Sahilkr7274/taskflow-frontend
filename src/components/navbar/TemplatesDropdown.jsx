import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../../api';
import TEMPLATES from '../../data/templates';
import toast from 'react-hot-toast';

export default function TemplatesDropdown({ onBoardCreated }) {
  const [open, setOpen]       = useState(false);
  const [creating, setCreating] = useState(null);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleTemplate = async (tpl) => {
    setCreating(tpl.name);
    try {
      const board = await api.createBoardFromTemplate({
        title: tpl.name,
        background: tpl.background,
        lists: tpl.lists,
      });
      onBoardCreated?.(board);
      setOpen(false);
      toast.success(`"${tpl.name}" board created!`);
      navigate(`/board/${board.id}`);
    } catch {
      toast.error('Failed to create from template');
    } finally {
      setCreating(null);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 text-[#B6C2CF] hover:bg-white/10 hover:text-white px-3 py-1.5 rounded text-sm transition-colors"
      >
        Templates <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-9 left-0 w-72 bg-[#282E33] border border-white/10 rounded-xl shadow-2xl z-50 p-2"
          >
            <p className="text-xs text-[#8C9BAB] font-semibold uppercase tracking-wider px-2 py-1.5">Most Popular</p>
            {TEMPLATES.map(tpl => (
              <motion.button
                key={tpl.name}
                whileHover={{ x: 3 }}
                onClick={() => handleTemplate(tpl)}
                disabled={!!creating}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors text-left group"
              >
                <div className={`board-${tpl.background} w-10 h-7 rounded flex-shrink-0 flex items-center justify-center text-base`}>
                  {tpl.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#B6C2CF] group-hover:text-white font-medium">
                    {creating === tpl.name ? 'Creating…' : tpl.name}
                  </p>
                  <p className="text-xs text-[#8C9BAB] truncate">{tpl.desc}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
