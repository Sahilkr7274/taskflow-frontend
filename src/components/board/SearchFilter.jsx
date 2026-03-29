import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown } from 'lucide-react';
import * as api from '../../api';
import { format } from 'date-fns';

export default function SearchFilter({ boardId, labels, members, onResults, onClear }) {
  const [query, setQuery] = useState('');
  const [selectedLabels, setSelectedLabels] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [dueFilter, setDueFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  const hasFilters = query || selectedLabels.length || selectedMembers.length || dueFilter;

  useEffect(() => {
    if (!hasFilters) { onClear(); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await api.searchCards(boardId, {
          q: query,
          labels: selectedLabels.join(','),
          members: selectedMembers.join(','),
          due: dueFilter,
        });
        onResults(results);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, selectedLabels, selectedMembers, dueFilter]);

  const clearAll = () => {
    setQuery(''); setSelectedLabels([]); setSelectedMembers([]); setDueFilter('');
    onClear();
  };

  const toggleLabel = (id) => setSelectedLabels(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleMember = (id) => setSelectedMembers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/70" />
          <input
            className="bg-white/20 hover:bg-white/30 focus:bg-white text-white placeholder-white/70 focus:text-gray-900 focus:placeholder-gray-400 rounded-md pl-8 pr-3 py-1.5 text-sm w-48 focus:w-64 transition-all focus:outline-none"
            placeholder="Search cards…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm transition-colors
            ${showFilters || (selectedLabels.length || selectedMembers.length || dueFilter) ? 'bg-white text-blue-700 font-medium' : 'bg-white/20 hover:bg-white/30 text-white'}`}
        >
          Filter <ChevronDown size={12} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          {(selectedLabels.length + selectedMembers.length + (dueFilter ? 1 : 0)) > 0 && (
            <span className="bg-blue-600 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
              {selectedLabels.length + selectedMembers.length + (dueFilter ? 1 : 0)}
            </span>
          )}
        </button>

        {hasFilters && (
          <button onClick={clearAll} className="text-white/80 hover:text-white text-sm flex items-center gap-1">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute top-10 left-0 bg-white rounded-xl shadow-modal z-30 w-72 p-4 border border-gray-200"
          >
            {/* Labels */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Labels</p>
              <div className="flex flex-wrap gap-1.5">
                {labels.map(l => (
                  <button
                    key={l.id}
                    onClick={() => toggleLabel(l.id)}
                    className={`px-2 py-1 rounded-full text-xs font-medium text-white transition-all
                      ${selectedLabels.includes(l.id) ? 'ring-2 ring-offset-1 ring-gray-400 scale-105' : 'opacity-80 hover:opacity-100'}`}
                    style={{ backgroundColor: l.color }}
                  >
                    {l.name || l.color}
                  </button>
                ))}
              </div>
            </div>

            {/* Members */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Members</p>
              <div className="flex flex-wrap gap-2">
                {members.map(m => (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all border
                      ${selectedMembers.includes(m.id) ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: m.avatar_color }}>
                      {m.name[0]}
                    </div>
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Due date */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Due Date</p>
              <div className="flex gap-2">
                {[
                  { v: 'overdue', l: '⚠ Overdue', desc: 'Past due date' },
                  { v: 'due_soon', l: '⏰ Due Soon', desc: 'Within 3 days' }
                ].map(opt => (
                  <button
                    key={opt.v}
                    onClick={() => setDueFilter(dueFilter === opt.v ? '' : opt.v)}
                    title={opt.desc}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors
                      ${dueFilter === opt.v ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">Only cards with a due date set will appear</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
