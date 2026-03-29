import { Link } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { Star, Clock, LayoutDashboard, Users, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNav } from '../context/NavContext';

export default function HomeDashboard() {
  const { boards } = useOutletContext();
  const { recentBoards, starredBoards, trackRecent } = useNav();

  const displayRecent  = recentBoards.length > 0 ? recentBoards : boards.slice(0, 4);
  const totalCards     = 0; // would come from backend aggregate
  const totalMembers   = 3; // seeded users

  const stats = [
    { icon: <LayoutDashboard size={18} />, label: 'Total Boards',  value: boards.length,  color: 'text-blue-400' },
    { icon: <CreditCard size={18} />,      label: 'Total Cards',   value: totalCards,     color: 'text-purple-400' },
    { icon: <Users size={18} />,           label: 'Members',       value: totalMembers,   color: 'text-green-400' },
    { icon: <Star size={18} />,            label: 'Starred',       value: starredBoards.length, color: 'text-yellow-400' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-white font-bold text-xl mb-6">Home</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3">
            <span className={s.color}>{s.icon}</span>
            <div>
              <p className="text-white font-bold text-lg leading-none">{s.value}</p>
              <p className="text-[#8C9BAB] text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recently Viewed */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={16} className="text-[#B6C2CF]" />
          <h2 className="text-[#B6C2CF] font-semibold text-sm">Recently Viewed</h2>
        </div>
        {displayRecent.length === 0 ? (
          <p className="text-[#8C9BAB] text-sm">No recent boards yet. Open a board to track it here.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayRecent.map(board => (
              <motion.div key={board.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Link
                  to={`/board/${board.id}`}
                  onClick={() => trackRecent(board)}
                  className="block group"
                >
                  <div className={`board-${board.background} rounded-xl h-20 p-3 hover:brightness-110 hover:shadow-lg hover:shadow-black/30 transition-all relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="font-semibold text-sm text-white relative z-10 leading-tight">{board.title}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Starred Boards */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Star size={16} className="text-yellow-400" />
          <h2 className="text-[#B6C2CF] font-semibold text-sm">Starred Boards</h2>
        </div>
        {starredBoards.length === 0 ? (
          <p className="text-[#8C9BAB] text-sm">No starred boards yet. Star a board to pin it here.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
            {starredBoards.map(board => (
              <motion.div key={board.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Link to={`/board/${board.id}`} onClick={() => trackRecent(board)} className="block group">
                  <div className={`board-${board.background} rounded-xl h-20 p-3 hover:brightness-110 hover:shadow-lg hover:shadow-black/30 transition-all relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="font-semibold text-sm text-white relative z-10 leading-tight">{board.title}</span>
                    <Star size={12} className="absolute bottom-2 right-2 text-yellow-400 fill-yellow-400" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
