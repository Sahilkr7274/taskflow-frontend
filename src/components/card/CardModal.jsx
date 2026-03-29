import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Tag, Calendar, CheckSquare, User, Trash2, Check, AlignLeft } from 'lucide-react';
import * as api from '../../api';
import toast from 'react-hot-toast';
import { format, startOfDay, addDays } from 'date-fns';
import { useBoard } from '../../context/BoardContext';

const LABEL_COLORS = ['#0052CC','#FF5630','#6554C0','#00875A','#FF8B00','#00B8D9','#FF7452','#57D9A3'];

export default function CardModal({ card: initialCard, boardId, onClose, onUpdate, onDelete }) {
  const [card, setCard] = useState(initialCard);
  const [users, setUsers] = useState([]);
  const [boardLabels, setBoardLabels] = useState([]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState(initialCard.title);
  const [desc, setDesc] = useState(initialCard.description || '');
  const [newItem, setNewItem] = useState('');
  const [activePanel, setActivePanel] = useState(null);
  const [newLabelColor, setNewLabelColor] = useState('#0052CC');
  const [newLabelName, setNewLabelName] = useState('');
  // Due date input state — plain date string "YYYY-MM-DD"
  const [dueDateInput, setDueDateInput] = useState(
    initialCard.due_date ? format(new Date(initialCard.due_date), 'yyyy-MM-dd') : ''
  );
  const titleRef = useRef(null);
  const { editCard } = useBoard();

  useEffect(() => {
    Promise.all([
      api.getCard(initialCard.id),
      api.getUsers(),
      api.getBoardLabels(boardId),
    ]).then(([fullCard, allUsers, labels]) => {
      setCard(fullCard);
      setTitle(fullCard.title);
      setDesc(fullCard.description || '');
      setDueDateInput(fullCard.due_date ? format(new Date(fullCard.due_date), 'yyyy-MM-dd') : '');
      setUsers(allUsers);
      setBoardLabels(labels);
    });
  }, [initialCard.id, boardId]);

  useEffect(() => {
    if (editingTitle && titleRef.current) titleRef.current.focus();
  }, [editingTitle]);

  const refreshCard = async () => {
    const updated = await api.getCard(card.id);
    setCard(updated);
    onUpdate(updated);
  };

  const saveTitle = async () => {
    if (!title.trim() || title === card.title) { setTitle(card.title); setEditingTitle(false); return; }
    try {
      await editCard(card.id, { title: title.trim() });
      setCard(c => ({ ...c, title: title.trim() }));
    } catch { toast.error('Failed to update title'); }
    setEditingTitle(false);
  };

  const saveDesc = async () => {
    try {
      await editCard(card.id, { description: desc });
      setCard(c => ({ ...c, description: desc }));
      toast.success('Description saved');
    } catch { toast.error('Failed to save description'); }
    setEditingDesc(false);
  };

  // Save due date when input changes and is valid or cleared
  const handleDueDateChange = async (e) => {
    const val = e.target.value; // "YYYY-MM-DD" or ""
    setDueDateInput(val);
    const isoDate = val ? new Date(val + 'T00:00:00').toISOString() : null;
    try {
      await editCard(card.id, { due_date: isoDate });
      setCard(c => ({ ...c, due_date: isoDate }));
      onUpdate({ ...card, due_date: isoDate });
      if (val) toast.success('Due date set');
      else toast.success('Due date removed');
    } catch { toast.error('Failed to update due date'); }
  };

  const handleToggleLabel = async (labelId) => {
    try {
      await api.toggleLabel(card.id, labelId);
      await refreshCard();
    } catch { toast.error('Failed to toggle label'); }
  };

  const handleCreateLabel = async () => {
    if (!newLabelColor) return;
    try {
      const label = await api.createLabel(boardId, { name: newLabelName, color: newLabelColor });
      setBoardLabels(prev => [...prev, label]);
      setNewLabelName('');
      toast.success('Label created');
    } catch { toast.error('Failed to create label'); }
  };

  const handleToggleMember = async (userId) => {
    try {
      await api.toggleMember(card.id, userId);
      await refreshCard();
    } catch { toast.error('Failed to toggle member'); }
  };

  const handleAddChecklist = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;
    try {
      const item = await api.addChecklistItem(card.id, { text: newItem.trim() });
      setCard(c => ({ ...c, checklist: [...(c.checklist || []), item] }));
      setNewItem('');
    } catch { toast.error('Failed to add item'); }
  };

  const handleToggleChecklist = async (item) => {
    try {
      const updated = await api.updateChecklistItem(card.id, item.id, { completed: !item.completed });
      setCard(c => ({ ...c, checklist: c.checklist.map(i => i.id === item.id ? updated : i) }));
    } catch { toast.error('Failed to update item'); }
  };

  const handleDeleteChecklist = async (itemId) => {
    try {
      await api.deleteChecklistItem(card.id, itemId);
      setCard(c => ({ ...c, checklist: c.checklist.filter(i => i.id !== itemId) }));
    } catch { toast.error('Failed to delete item'); }
  };

  const handleDeleteCard = async () => {
    if (!confirm('Delete this card?')) return;
    try {
      await api.deleteCard(card.id);
      onDelete(card.id);
      onClose();
      toast.success('Card deleted');
    } catch { toast.error('Failed to delete card'); }
  };

  const completedCount = card.checklist?.filter(i => i.completed).length || 0;
  const totalCount = card.checklist?.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Due date status — date-only comparison matches backend CURRENT_DATE logic
  const dueDate = card.due_date ? new Date(card.due_date) : null;
  const today = startOfDay(new Date());
  const dueDay = dueDate ? startOfDay(dueDate) : null;
  const isOverdue = dueDay && dueDay < today;
  const isDueSoon = dueDay && dueDay >= today && dueDay <= addDays(today, 3);

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 p-4 pt-10 overflow-y-auto"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-gray-100 rounded-2xl w-full max-w-2xl shadow-modal relative mb-8"
        initial={{ scale: 0.95, opacity: 0, y: -20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-full p-1.5 transition-colors z-10"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="px-6 pt-6 pb-2">
          {editingTitle ? (
            <textarea
              ref={titleRef}
              className="w-full text-lg font-semibold bg-white border border-blue-400 rounded-lg px-3 py-2 resize-none focus:outline-none pr-10"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onBlur={saveTitle}
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); saveTitle(); }
                if (e.key === 'Escape') { setTitle(card.title); setEditingTitle(false); }
              }}
              rows={2}
            />
          ) : (
            <h2
              className="text-lg font-semibold text-gray-900 cursor-pointer hover:bg-gray-200 rounded-lg px-3 py-2 -mx-3 pr-10 leading-snug"
              onClick={() => setEditingTitle(true)}
            >
              {card.title}
            </h2>
          )}

          {/* Active labels preview */}
          {card.labels?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 px-1">
              {card.labels.map(l => (
                <span
                  key={l.id}
                  className="px-3 py-1 rounded-full text-white text-xs font-semibold cursor-pointer hover:opacity-80"
                  style={{ backgroundColor: l.color }}
                  onClick={() => setActivePanel('labels')}
                  title="Click to edit labels"
                >
                  {l.name || l.color}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-4 px-6 pb-6">
          {/* ── Main content ── */}
          <div className="flex-1 space-y-5 min-w-0">

            {/* Due Date — always visible */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Calendar size={13} /> Due Date
              </h4>
              <div className="flex items-center gap-3 flex-wrap">
                <input
                  type="date"
                  value={dueDateInput}
                  onChange={handleDueDateChange}
                  className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
                />
                {dueDate && (
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full
                    ${isOverdue ? 'bg-red-100 text-red-700' : isDueSoon ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {isOverdue ? '⚠ Overdue' : isDueSoon ? '⏰ Due soon' : '✓ On track'}
                    {' · '}{format(dueDate, 'MMM d, yyyy')}
                  </span>
                )}
                {dueDate && (
                  <button
                    onClick={() => handleDueDateChange({ target: { value: '' } })}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                  >
                    Remove
                  </button>
                )}
              </div>
              {!dueDate && (
                <p className="text-xs text-gray-400 mt-1">No due date set — pick one above to enable overdue/due-soon filters</p>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <AlignLeft size={13} /> Description
              </h4>
              {editingDesc ? (
                <div>
                  <textarea
                    autoFocus
                    className="w-full bg-white border border-blue-400 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none min-h-[90px]"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Add a more detailed description…"
                  />
                  <div className="flex gap-2 mt-2">
                    <button onClick={saveDesc} className="btn-primary">Save</button>
                    <button onClick={() => { setDesc(card.description || ''); setEditingDesc(false); }} className="text-sm text-gray-600 hover:text-gray-800 px-2">Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setEditingDesc(true)}
                  className="min-h-[56px] bg-gray-200 hover:bg-gray-300 rounded-lg px-3 py-2 text-sm text-gray-600 cursor-pointer transition-colors"
                >
                  {card.description || 'Add a more detailed description…'}
                </div>
              )}
            </div>

            {/* Checklist */}
            {(card.checklist?.length > 0 || activePanel === 'checklist') && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <CheckSquare size={13} /> Checklist
                  <span className="font-normal normal-case text-gray-400">{completedCount}/{totalCount}</span>
                </h4>
                {totalCount > 0 && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-500 w-8 text-right">{progress}%</span>
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                        initial={{ width: 0 }} animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5 mb-3">
                  {card.checklist?.map(item => (
                    <div key={item.id} className="flex items-center gap-2 group bg-white rounded-lg px-3 py-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item)}
                        className="w-4 h-4 rounded cursor-pointer accent-blue-600 flex-shrink-0"
                      />
                      <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                        {item.text}
                      </span>
                      <button
                        onClick={() => handleDeleteChecklist(item.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleAddChecklist} className="flex gap-2">
                  <input
                    className="input-base flex-1"
                    placeholder="Add an item…"
                    value={newItem}
                    onChange={e => setNewItem(e.target.value)}
                  />
                  <button type="submit" className="btn-primary">Add</button>
                </form>
              </div>
            )}

            {/* Members display */}
            {card.members?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <User size={13} /> Members
                </h4>
                <div className="flex flex-wrap gap-2">
                  {card.members.map(m => (
                    <div
                      key={m.id}
                      className="flex items-center gap-2 bg-white rounded-full px-3 py-1 shadow-sm cursor-pointer hover:bg-red-50 group"
                      onClick={() => handleToggleMember(m.id)}
                      title="Click to remove"
                    >
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: m.avatar_color }}>
                        {m.name[0]}
                      </div>
                      <span className="text-xs text-gray-700 group-hover:text-red-600">{m.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <div className="w-36 space-y-2 flex-shrink-0 pt-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Add to card</p>

            {[
              { id: 'members', icon: <User size={14} />, label: 'Members' },
              { id: 'labels', icon: <Tag size={14} />, label: 'Labels' },
              { id: 'checklist', icon: <CheckSquare size={14} />, label: 'Checklist' },
            ].map(btn => (
              <button
                key={btn.id}
                onClick={() => setActivePanel(activePanel === btn.id ? null : btn.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activePanel === btn.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
              >
                {btn.icon} {btn.label}
              </button>
            ))}

            <div className="pt-2 border-t border-gray-300">
              <button
                onClick={handleDeleteCard}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gray-200 hover:bg-red-100 hover:text-red-600 text-gray-700 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>

        {/* ── Expandable Panels ── */}
        <AnimatePresence>
          {activePanel && (
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
              className="mx-6 mb-6 bg-white rounded-xl p-4 shadow-card border border-gray-200"
            >
              {/* Labels panel */}
              {activePanel === 'labels' && (
                <div>
                  <h5 className="text-sm font-semibold mb-3">Labels</h5>
                  <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
                    {boardLabels.length === 0 && (
                      <p className="text-xs text-gray-400 py-2">No labels yet — create one below</p>
                    )}
                    {boardLabels.map(label => {
                      const isActive = card.labels?.some(l => l.id === label.id);
                      return (
                        <button
                          key={label.id}
                          onClick={() => handleToggleLabel(label.id)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <span className="w-10 h-6 rounded flex-shrink-0" style={{ backgroundColor: label.color }} />
                          <span className="flex-1 text-sm text-left">{label.name || label.color}</span>
                          {isActive && <Check size={14} className="text-blue-600 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Create new label</p>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {LABEL_COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setNewLabelColor(c)}
                          className={`w-7 h-7 rounded-full transition-transform ${newLabelColor === c ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'}`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <input
                      className="input-base mb-2"
                      placeholder="Label name (optional)"
                      value={newLabelName}
                      onChange={e => setNewLabelName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleCreateLabel()}
                    />
                    <button onClick={handleCreateLabel} className="btn-primary w-full">Create Label</button>
                  </div>
                </div>
              )}

              {/* Members panel */}
              {activePanel === 'members' && (
                <div>
                  <h5 className="text-sm font-semibold mb-3">Assign Members</h5>
                  <div className="space-y-1">
                    {users.map(user => {
                      const isActive = card.members?.some(m => m.id === user.id);
                      return (
                        <button
                          key={user.id}
                          onClick={() => handleToggleMember(user.id)}
                          className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors
                            ${isActive ? 'bg-blue-50 hover:bg-blue-100' : 'hover:bg-gray-50'}`}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                            style={{ backgroundColor: user.avatar_color }}
                          >
                            {user.name[0]}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-medium">{user.name}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                          {isActive
                            ? <Check size={14} className="text-blue-600 flex-shrink-0" />
                            : <span className="text-xs text-gray-400">Add</span>
                          }
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Checklist panel */}
              {activePanel === 'checklist' && (
                <div>
                  <h5 className="text-sm font-semibold mb-3">Add Checklist Item</h5>
                  <form onSubmit={handleAddChecklist} className="flex gap-2">
                    <input
                      autoFocus
                      className="input-base flex-1"
                      placeholder="e.g. Write unit tests…"
                      value={newItem}
                      onChange={e => setNewItem(e.target.value)}
                    />
                    <button type="submit" className="btn-primary">Add</button>
                  </form>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
