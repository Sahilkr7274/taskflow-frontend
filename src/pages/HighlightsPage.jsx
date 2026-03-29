import { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Star, Clock, AlertCircle, Activity } from 'lucide-react';
import { useNav } from '../context/NavContext';
import * as api from '../api';

const RECENT_ACTIVITY = [
  { id: 1, icon: '🔀', text: 'Card "Build auth system" moved to Done',       time: '2m ago' },
  { id: 2, icon: '👤', text: 'Sara Lee assigned to "Dashboard UI"',           time: '15m ago' },
  { id: 3, icon: '✅', text: 'Mike Chen completed checklist on "Deploy v1.0"', time: '1h ago' },
  { id: 4, icon: '🏷️', text: 'Label "Urgent" added to "Fix payment bug"',    time: '3h ago' },
  { id: 5, icon: '➕', text: 'New card "Mobile responsive fixes" created',    time: '1d ago' },
];

export default function HighlightsPage() {
  const { boards } = useOutletContext();
  const { starredBoards, trackRecent } = useNav();
  const [overdue, setOverdue]   = useState([]);
  const [dueSoon, setDueSoon]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    if (boards.length === 0) { setLoading(false); return; }
    // Search overdue + due_soon cards across all boards (up to 5)
    Promise.all(
      boards.slice(0, 5).map(b =>
        Promise.all([
          api.searchCards(b.id, { due: 'overdue'  }).then(cards => cards.map(c => ({ ...c, boardTitle: b.title, boardId: b.id }))),
          api.searchCards(b.id, { due: 'due_soon' }).then(cards => cards.map(c => ({ ...c, boardTitle: b.title, boardId: b.id }))),
        ])
      )
    ).then(results => {
      setOverdue(results.flatMap(r => r[0]));
      setDueSoon(results.flatMap(r => r[1]));
    }).catch(() => {}).finally(() => setLoading(false));
  }, [boards]);

  const formatDate = (d) => d ? new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';

  const CardRow = ({ card, accent }) => (
    <Link
      to={`/board/${card.boardId}`}
      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors rounded-lg group"
    >
      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${accent}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[#B6C2CF] group-hover:text-white truncate">{card.title}</p>
        <p className="text-xs text-[#8C9BAB] truncate">{card.boardTitle}</p>
      </div>
      <span className={`text-xs flex-shrink-0 ${accent.replace('bg-', 'text-')}`}>{formatDate(card.due_date)}</span>
    </Link>
  );

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-white font-bold text-xl">Highlights</h1>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Activity size={16} className="text-[#B6C2CF]" />
          <h2 className="text-[#B6C2CF] font-semibold text-sm">Recent Activity</h2>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
          {RECENT_ACTIVITY.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-start gap-3 px-4 py-3 ${i < RECENT_ACTIVITY.length - 1 ? 'border-b border-white/5' : ''}`}
            >
              <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
              <p className="text-sm text-[#B6C2CF] flex-1">{item.text}</p>
              <span className="text-xs text-[#8C9BAB] flex-shrink-0">{item.time}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Starred Boards */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Star size={16} className="text-yellow-400" />
          <h2 className="text-[#B6C2CF] font-semibold text-sm">Starred Boards</h2>
        </div>
        {starredBoards.length === 0 ? (
          <p className="text-[#8C9BAB] text-sm">No starred boards yet.</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {starredBoards.map(b => (
              <Link
                key={b.id}
                to={`/board/${b.id}`}
                onClick={() => trackRecent(b)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg px-3 py-2 transition-colors group"
              >
                <div className={`w-5 h-4 rounded board-${b.background} flex-shrink-0`} />
                <span className="text-sm text-[#B6C2CF] group-hover:text-white">{b.title}</span>
                <Star size={11} className="text-yellow-400 fill-yellow-400" />
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Due Soon */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-orange-400" />
          <h2 className="text-[#B6C2CF] font-semibold text-sm">Due Soon</h2>
          {!loading && <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{dueSoon.length}</span>}
        </div>
        {loading ? (
          <p className="text-[#8C9BAB] text-sm">Loading…</p>
        ) : dueSoon.length === 0 ? (
          <p className="text-[#8C9BAB] text-sm">No cards due in the next 3 days.</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {dueSoon.map(c => <CardRow key={c.id} card={c} accent="bg-orange-400" />)}
          </div>
        )}
      </section>

      {/* Overdue */}
      <section>
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-red-400" />
          <h2 className="text-[#B6C2CF] font-semibold text-sm">Overdue</h2>
          {!loading && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">{overdue.length}</span>}
        </div>
        {loading ? (
          <p className="text-[#8C9BAB] text-sm">Loading…</p>
        ) : overdue.length === 0 ? (
          <p className="text-[#8C9BAB] text-sm">No overdue cards. Great job! 🎉</p>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            {overdue.map(c => <CardRow key={c.id} card={c} accent="bg-red-400" />)}
          </div>
        )}
      </section>
    </div>
  );
}
