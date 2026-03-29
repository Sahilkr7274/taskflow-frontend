import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useBoard } from '../context/BoardContext';
import List from '../components/board/List';
import CardModal from '../components/card/CardModal';
import SearchFilter from '../components/board/SearchFilter';
import * as api from '../api';
import toast from 'react-hot-toast';

export default function Board() {
  const { id } = useParams();
  const { board, loading, loadBoard, setBoard, addList, moveCardOptimistic, reorderListsOptimistic, removeCard } = useBoard();
  const [selectedCard, setSelectedCard] = useState(null);
  const [addingList, setAddingList] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [searchResults, setSearchResults] = useState(null); // null = no filter active

  useEffect(() => { loadBoard(id); }, [id]);

  const onDragEnd = async (result) => {
    const { source, destination, type, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    if (type === 'LIST') {
      const newLists = Array.from(board.lists);
      const [moved] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, moved);
      reorderListsOptimistic(newLists);
      try {
        await api.reorderLists(board.id, newLists.map(l => l.id));
      } catch {
        toast.error('Failed to reorder lists');
        loadBoard(id);
      }
      return;
    }

    // Card move
    const cardId = draggableId;
    const srcListId = source.droppableId;
    const dstListId = destination.droppableId;
    moveCardOptimistic(cardId, srcListId, dstListId, source.index, destination.index);
    try {
      await api.moveCard(cardId, { listId: dstListId, position: destination.index });
    } catch {
      toast.error('Failed to move card');
      loadBoard(id);
    }
  };

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!listTitle.trim()) return;
    try {
      await addList(listTitle.trim());
      setListTitle('');
    } catch {
      toast.error('Failed to add list');
    }
  };

  const handleCardUpdate = useCallback((updated) => {
    setBoard(b => ({
      ...b,
      lists: b.lists.map(l => ({
        ...l,
        cards: l.cards.map(c => c.id === updated.id
          ? { ...c, ...updated, labels: updated.labels ?? c.labels, members: updated.members ?? c.members, checklist: updated.checklist ?? c.checklist }
          : c
        ),
      })),
    }));
  }, [setBoard]);

  const handleCardDelete = (cardId) => {
    removeCard(cardId);
  };

  // Compute visible lists based on search
  const visibleLists = searchResults
    ? board?.lists.map(l => ({
        ...l,
        cards: l.cards.filter(c => searchResults.some(r => r.id === c.id)),
      }))
    : board?.lists;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading board…</p>
        </div>
      </div>
    );
  }

  if (!board) return null;

  const isLight = board.background === 'gradient-white';
  const headerText = isLight ? 'text-gray-800' : 'text-white';
  const headerTextMuted = isLight ? 'text-gray-500 hover:text-gray-800' : 'text-white/80 hover:text-white';

  return (
    <div className={`min-h-screen board-${board.background} flex flex-col`}>
      {/* Board Header */}
      <header className={`${isLight ? 'bg-black/10' : 'bg-black/20'} backdrop-blur-sm px-4 py-2.5 flex items-center gap-3 flex-wrap`}>
        <Link to="/" className={`${headerTextMuted} transition-colors`}>
          <ArrowLeft size={20} />
        </Link>
        <LayoutDashboard size={20} className={headerText} />
        <h1 className={`${headerText} font-bold text-lg mr-4`}>{board.title}</h1>

        <div className="ml-auto flex items-center gap-3 flex-wrap">
          <SearchFilter
            boardId={board.id}
            labels={board.labels || []}
            members={board.members || []}
            onResults={setSearchResults}
            onClear={() => setSearchResults(null)}
          />
          {/* Member avatars */}
          <div className="flex -space-x-2">
            {board.members?.map(m => (
              <div key={m.id} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: m.avatar_color }} title={m.name}>
                {m.name[0]}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Search results banner */}
      {searchResults && (
        <div className="bg-yellow-400/90 text-yellow-900 text-sm px-4 py-1.5 font-medium">
          Showing {searchResults.length} matching card{searchResults.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Board Content */}
      <div className="flex-1 overflow-x-auto p-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="LIST" direction="horizontal">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex gap-3 items-start h-full"
              >
                {visibleLists?.map((list, index) => (
                  <List
                    key={list.id}
                    list={list}
                    index={index}
                    onCardClick={setSelectedCard}
                  />
                ))}
                {provided.placeholder}

                {/* Add List */}
                <div className="flex-shrink-0 w-72">
                  <AnimatePresence mode="wait">
                    {addingList ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        className="bg-[#ebecf0] rounded-xl p-3"
                      >
                        <form onSubmit={handleAddList}>
                          <input
                            autoFocus
                            className="input-base mb-2"
                            placeholder="Enter list title…"
                            value={listTitle}
                            onChange={e => setListTitle(e.target.value)}
                            onKeyDown={e => e.key === 'Escape' && setAddingList(false)}
                          />
                          <div className="flex items-center gap-2">
                            <button type="submit" className="btn-primary">Add list</button>
                            <button type="button" onClick={() => setAddingList(false)} className="text-gray-600 hover:text-gray-800">
                              <X size={18} />
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        onClick={() => setAddingList(true)}
                        className={`w-full flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-colors backdrop-blur-sm
                          ${isLight ? 'bg-black/10 hover:bg-black/20 text-gray-800' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                      >
                        <Plus size={18} /> Add another list
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* Card Modal */}
      <AnimatePresence>
        {selectedCard && (
          <CardModal
            card={selectedCard}
            boardId={board.id}
            onClose={() => setSelectedCard(null)}
            onUpdate={handleCardUpdate}
            onDelete={handleCardDelete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
