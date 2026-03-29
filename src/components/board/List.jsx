import { useState, useRef, useEffect } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MoreHorizontal, X, Pencil, Trash2 } from 'lucide-react';
import Card from './Card';
import { useBoard } from '../../context/BoardContext';
import toast from 'react-hot-toast';

export default function List({ list, index, onCardClick }) {
  const { addCard, editList, removeList } = useBoard();
  const [addingCard, setAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [editingTitle, setEditingTitle] = useState(false);
  const [listTitle, setListTitle] = useState(list.title);
  const [showMenu, setShowMenu] = useState(false);
  const textareaRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    if (addingCard && textareaRef.current) textareaRef.current.focus();
  }, [addingCard]);

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [editingTitle]);

  const handleAddCard = async () => {
    if (!cardTitle.trim()) return setAddingCard(false);
    try {
      await addCard(list.id, cardTitle.trim());
      setCardTitle('');
      textareaRef.current?.focus();
    } catch {
      toast.error('Failed to add card');
    }
  };

  const handleTitleSave = async () => {
    if (listTitle.trim() && listTitle !== list.title) {
      try {
        await editList(list.id, listTitle.trim());
      } catch {
        setListTitle(list.title);
        toast.error('Failed to update list');
      }
    } else {
      setListTitle(list.title);
    }
    setEditingTitle(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${list.title}" and all its cards?`)) return;
    try {
      await removeList(list.id);
      toast.success('List deleted');
    } catch {
      toast.error('Failed to delete list');
    }
    setShowMenu(false);
  };

  return (
    <Draggable draggableId={`list-${list.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`flex-shrink-0 w-72 ${snapshot.isDragging ? 'opacity-90' : ''}`}
        >
          <div className="bg-[#ebecf0] rounded-xl flex flex-col max-h-[calc(100vh-140px)]">
            {/* List Header */}
            <div className="flex items-center gap-2 px-3 pt-3 pb-1" {...provided.dragHandleProps}>
              {editingTitle ? (
                <input
                  ref={titleRef}
                  className="flex-1 bg-white border border-blue-400 rounded px-2 py-1 text-sm font-semibold focus:outline-none"
                  value={listTitle}
                  onChange={e => setListTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={e => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') { setListTitle(list.title); setEditingTitle(false); } }}
                />
              ) : (
                <h3
                  className="flex-1 font-semibold text-sm text-gray-800 cursor-pointer hover:bg-gray-200 rounded px-2 py-1 -mx-2"
                  onClick={() => setEditingTitle(true)}
                >
                  {list.title}
                  <span className="ml-1.5 text-gray-500 font-normal">{list.cards.length}</span>
                </h3>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 hover:bg-gray-300 rounded transition-colors text-gray-600"
                >
                  <MoreHorizontal size={16} />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 top-8 bg-white rounded-lg shadow-modal z-20 w-44 py-1 border border-gray-200"
                    >
                      <button
                        onClick={() => { setEditingTitle(true); setShowMenu(false); }}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
                      >
                        <Pencil size={14} /> Rename List
                      </button>
                      <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Delete List
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Cards */}
            <Droppable droppableId={list.id} type="CARD">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`px-2 py-1 overflow-y-auto flex-1 min-h-[2px] transition-colors
                    ${snapshot.isDraggingOver ? 'bg-blue-100/50' : ''}`}
                >
                  {list.cards.map((card, i) => (
                    <Card key={card.id} card={card} index={i} onClick={onCardClick} />
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>

            {/* Add Card */}
            <div className="px-2 pb-2">
              <AnimatePresence mode="wait">
                {addingCard ? (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <textarea
                      ref={textareaRef}
                      className="w-full bg-white rounded-lg p-2 text-sm resize-none focus:outline-none shadow-card border border-blue-400 min-h-[60px]"
                      placeholder="Enter a title for this card…"
                      value={cardTitle}
                      onChange={e => setCardTitle(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddCard(); }
                        if (e.key === 'Escape') { setAddingCard(false); setCardTitle(''); }
                      }}
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <button onClick={handleAddCard} className="btn-primary">Add card</button>
                      <button onClick={() => { setAddingCard(false); setCardTitle(''); }} className="text-gray-600 hover:text-gray-800">
                        <X size={18} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <button
                    onClick={() => setAddingCard(true)}
                    className="w-full flex items-center gap-2 text-gray-600 hover:bg-gray-300/60 hover:text-gray-800 rounded-lg px-2 py-1.5 text-sm transition-colors"
                  >
                    <Plus size={16} /> Add a card
                  </button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
