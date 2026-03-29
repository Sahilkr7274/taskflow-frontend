import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import { useNav } from '../../context/NavContext';
import * as api from '../../api';

const FALLBACK_MEMBERS = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com', avatar_color: '#0052CC', role: 'Admin' },
  { id: '2', name: 'Sara Lee',     email: 'sara@example.com', avatar_color: '#E6007A', role: 'Member' },
  { id: '3', name: 'Mike Chen',    email: 'mike@example.com', avatar_color: '#00875A', role: 'Member' },
];

export default function WorkspaceMembersPage() {
  const { currentWorkspace } = useNav();
  const [members, setMembers] = useState([]);

  useEffect(() => {
    api.getUsers()
      .then(data => setMembers(data.length > 0 ? data : FALLBACK_MEMBERS))
      .catch(() => setMembers(FALLBACK_MEMBERS));
  }, []);

  const initials = (name) => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="p-8">
      <p className="text-xs text-[#8C9BAB] uppercase tracking-wider font-semibold mb-1">{currentWorkspace.name}</p>
      <div className="flex items-center gap-2 mb-6">
        <Users size={18} className="text-[#B6C2CF]" />
        <h1 className="text-[#B6C2CF] font-semibold text-base">Members</h1>
        <span className="ml-1 text-xs bg-white/10 text-[#8C9BAB] px-2 py-0.5 rounded-full">{members.length}</span>
      </div>

      <div className="space-y-2 max-w-xl">
        {members.map(m => (
          <div key={m.id} className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-xl px-4 py-3 hover:bg-white/8 transition-colors">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ backgroundColor: m.avatar_color }}>
              {initials(m.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium">{m.name}</p>
              <p className="text-[#8C9BAB] text-xs truncate">{m.email}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
              ${m.role === 'Admin' ? 'bg-blue-500/20 text-blue-400' : 'bg-white/10 text-[#8C9BAB]'}`}>
              {m.role || 'Member'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
