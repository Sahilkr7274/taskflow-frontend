import { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../api';
import toast from 'react-hot-toast';

const BoardContext = createContext(null);

export const BoardProvider = ({ children }) => {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadBoard = useCallback(async (id) => {
    setLoading(true);
    try {
      const data = await api.getBoard(id);
      setBoard(data);
    } catch {
      toast.error('Failed to load board');
    } finally {
      setLoading(false);
    }
  }, []);

  const addList = async (title) => {
    const list = await api.createList(board.id, { title });
    setBoard(b => ({ ...b, lists: [...b.lists, list] }));
    return list;
  };

  const editList = async (listId, title) => {
    await api.updateList(listId, { title });
    setBoard(b => ({ ...b, lists: b.lists.map(l => l.id === listId ? { ...l, title } : l) }));
  };

  const removeList = async (listId) => {
    await api.deleteList(listId);
    setBoard(b => ({ ...b, lists: b.lists.filter(l => l.id !== listId) }));
  };

  const addCard = async (listId, title) => {
    const card = await api.createCard(listId, { title });
    setBoard(b => ({
      ...b,
      lists: b.lists.map(l => l.id === listId ? { ...l, cards: [...l.cards, card] } : l),
    }));
    return card;
  };

  const editCard = async (cardId, updates) => {
    // Optimistically update title/description/due_date in board state immediately
    setBoard(b => ({
      ...b,
      lists: b.lists.map(l => ({
        ...l,
        cards: l.cards.map(c => c.id === cardId ? { ...c, ...updates } : c),
      })),
    }));
    try {
      const updated = await api.updateCard(cardId, updates);
      // Merge API response but preserve labels/members/checklist already on the card
      setBoard(b => ({
        ...b,
        lists: b.lists.map(l => ({
          ...l,
          cards: l.cards.map(c => {
            if (c.id !== cardId) return c;
            return {
              ...c,
              ...updated,
              labels: updated.labels ?? c.labels,
              members: updated.members ?? c.members,
              checklist: updated.checklist ?? c.checklist,
            };
          }),
        })),
      }));
      return updated;
    } catch (e) {
      // Revert optimistic update on failure
      throw e;
    }
  };

  const removeCard = (cardId) => {
    setBoard(b => ({
      ...b,
      lists: b.lists.map(l => ({ ...l, cards: l.cards.filter(c => c.id !== cardId) })),
    }));
  };

  // Optimistic same-list card reorder
  const reorderCardsOptimistic = (listId, newCards) => {
    setBoard(b => ({
      ...b,
      lists: b.lists.map(l => l.id === listId ? { ...l, cards: newCards } : l),
    }));
  };

  // Optimistic cross-list card move
  const moveCardOptimistic = (cardId, srcListId, dstListId, srcIndex, dstIndex) => {
    setBoard(b => {
      const lists = b.lists.map(l => ({ ...l, cards: [...l.cards] }));
      const srcList = lists.find(l => l.id === srcListId);
      const dstList = lists.find(l => l.id === dstListId);
      const [card] = srcList.cards.splice(srcIndex, 1);
      dstList.cards.splice(dstIndex, 0, card);
      return { ...b, lists };
    });
  };

  const reorderListsOptimistic = (newLists) => {
    setBoard(b => ({ ...b, lists: newLists }));
  };

  return (
    <BoardContext.Provider value={{
      board, loading, loadBoard, setBoard,
      addList, editList, removeList,
      addCard, editCard, removeCard,
      reorderCardsOptimistic, moveCardOptimistic, reorderListsOptimistic,
    }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => useContext(BoardContext);
