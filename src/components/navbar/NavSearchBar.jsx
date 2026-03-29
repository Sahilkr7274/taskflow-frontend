import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, LayoutDashboard, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import * as api from '../../api';
import { useNav } from '../../context/NavContext';

export default function NavSearchBar() {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef  = useRef(null);
  const navigate    = useNavigate();
  const { trackRecent } = useNav();

  // Click outside to close
  useEffect(() => {
    const handler = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const search = useCallback(async (q) => {
    if (!q.trim()) { setResults(null); setOpen(false); return; }
    setLoading(true);
    try {
      // Search boards by title client-side from all boards
      const allBoards = await api.getBoards();
      const matchedBoards = allBoards.filter(b => b.title.toLowerCase().includes(q.toLowerCase()));

      // Search cards across all boards (use first 3 boards to avoid too many requests)
      const cardSearches = await Promise.all(
        allBoards.slice(0, 5).map(b =>
          api.searchCards(b.id, { q }).then(cards => cards.map(c => ({ ...c, boardTitle: b.title, boardId: b.id, boardBackground: b.background })))
        )
      );
      const matchedCards = cardSearches.flat().slice(0, 8);

      setResults({ boards: matchedBoards, cards: matchedCards });
      setOpen(true);
    } catch {
      setResults(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults(null); setOpen(false); return; }
    debounceRef.current = setTimeout(() => search(query), 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, search]);

  const handleBoardClick = (board) => {
    trackRecent(board);
    setQuery('');
    setOpen(false);
    navigate(`/board/${board.id}`);
  };

  const handleCardClick = (card) => {
    setQuery('');
    setOpen(false);
    navigate(`/board/${card.boardId}`);
  };

  const hasResults = results && (results.boards.length > 0 || results.cards.length > 0);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#B6C2CF]" />
        <input
          className="bg-[#2C333A] border border-white/20 text-[#B6C2CF] placeholder-[#B6C2CF]/60 rounded pl-8 pr-7 py-1.5 text-sm w-48 focus:outline-none focus:border-blue-400 focus:text-white focus:w-64 transition-all"
          placeholder="Search…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results && setOpen(true)}
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults(null); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8C9BAB] hover:text-white">
            <X size={12} />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-9 right-0 w-72 bg-[#282E33] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden"
          >
            {loading && (
              <div className="px-4 py-3 text-sm text-[#8C9BAB]">Searching…</div>
            )}

            {!loading && !hasResults && (
              <div className="px-4 py-3 text-sm text-[#8C9BAB]">No results for "{query}"</div>
            )}

            {!loading && hasResults && (
              <div className="py-2 max-h-80 overflow-y-auto">
                {results.boards.length > 0 && (
                  <>
                    <p className="text-xs text-[#8C9BAB] font-semibold uppercase tracking-wider px-4 py-1.5">Boards</p>
                    {results.boards.map(b => (
                      <button
                        key={b.id}
                        onClick={() => handleBoardClick(b)}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-left group"
                      >
                        <div className={`w-7 h-5 rounded board-${b.background} flex-shrink-0`} />
                        <span className="text-sm text-[#B6C2CF] group-hover:text-white truncate">{b.title}</span>
                      </button>
                    ))}
                  </>
                )}
                {results.cards.length > 0 && (
                  <>
                    <p className="text-xs text-[#8C9BAB] font-semibold uppercase tracking-wider px-4 py-1.5 mt-1">Cards</p>
                    {results.cards.map(c => (
                      <button
                        key={c.id}
                        onClick={() => handleCardClick(c)}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/10 transition-colors text-left group"
                      >
                        <CreditCard size={14} className="text-[#8C9BAB] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#B6C2CF] group-hover:text-white truncate">{c.title}</p>
                          <p className="text-xs text-[#8C9BAB] truncate">{c.boardTitle}</p>
                        </div>
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
