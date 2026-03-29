import { useState, useRef, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SHORTCUTS = [
  { keys: ['N'], desc: 'Create new card' },
  { keys: ['B'], desc: 'Open board menu' },
  { keys: ['F'], desc: 'Filter cards' },
  { keys: ['Esc'], desc: 'Close dialog / cancel' },
  { keys: ['?'], desc: 'Show shortcuts' },
];

const TIPS = [
  'Drag cards between lists to update their status.',
  'Click a card to open details, add labels, due dates & checklists.',
  'Use the Search bar to find cards across all boards.',
  'Star boards to pin them in the Starred dropdown.',
  'Use Templates to create a board with pre-filled lists & cards.',
];

export default function HelpDropdown() {
  const [open, setOpen] = useState(false);
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
        className="w-8 h-8 flex items-center justify-center text-[#B6C2CF] hover:bg-white/10 rounded-full transition-colors"
      >
        <HelpCircle size={16} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-10 right-0 w-72 bg-[#282E33] border border-white/10 rounded-xl shadow-2xl z-50"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <p className="text-white font-semibold text-sm">Help & Shortcuts</p>
              <button onClick={() => setOpen(false)} className="text-[#8C9BAB] hover:text-white transition-colors">
                <X size={14} />
              </button>
            </div>

            <div className="p-4">
              <p className="text-xs text-[#8C9BAB] font-semibold uppercase tracking-wider mb-2">Keyboard Shortcuts</p>
              <div className="space-y-1.5 mb-4">
                {SHORTCUTS.map(s => (
                  <div key={s.desc} className="flex items-center justify-between">
                    <span className="text-xs text-[#B6C2CF]">{s.desc}</span>
                    <div className="flex gap-1">
                      {s.keys.map(k => (
                        <kbd key={k} className="px-1.5 py-0.5 bg-white/10 text-[#B6C2CF] text-xs rounded border border-white/20 font-mono">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-xs text-[#8C9BAB] font-semibold uppercase tracking-wider mb-2">Tips</p>
              <ul className="space-y-1.5">
                {TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-blue-400 text-xs mt-0.5 flex-shrink-0">•</span>
                    <span className="text-xs text-[#B6C2CF] leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
