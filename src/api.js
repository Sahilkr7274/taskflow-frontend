import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api' });

// Boards
export const getBoards = () => api.get('/boards').then(r => r.data);
export const getBoard = (id) => api.get(`/boards/${id}`).then(r => r.data);
export const createBoard = (data) => api.post('/boards', data).then(r => r.data);
export const createBoardFromTemplate = (data) => api.post('/boards/template', data).then(r => r.data);
export const updateBoard = (id, data) => api.put(`/boards/${id}`, data).then(r => r.data);
export const deleteBoard = (id) => api.delete(`/boards/${id}`).then(r => r.data);
export const searchCards = (boardId, params) => api.get(`/boards/${boardId}/search`, { params }).then(r => r.data);

// Lists
export const createList = (boardId, data) => api.post(`/boards/${boardId}/lists`, data).then(r => r.data);
export const updateList = (id, data) => api.put(`/lists/${id}`, data).then(r => r.data);
export const deleteList = (id) => api.delete(`/lists/${id}`).then(r => r.data);
export const reorderLists = (boardId, orderedIds) => api.put(`/boards/${boardId}/lists/reorder`, { orderedIds }).then(r => r.data);

// Cards
export const getCard = (id) => api.get(`/cards/${id}`).then(r => r.data);
export const createCard = (listId, data) => api.post(`/lists/${listId}/cards`, data).then(r => r.data);
export const updateCard = (id, data) => api.put(`/cards/${id}`, data).then(r => r.data);
export const deleteCard = (id) => api.delete(`/cards/${id}`).then(r => r.data);
export const reorderCards = (listId, orderedIds) => api.put(`/lists/${listId}/cards/reorder`, { orderedIds }).then(r => r.data);
export const moveCard = (id, data) => api.put(`/cards/${id}/move`, data).then(r => r.data);
export const toggleLabel = (cardId, labelId) => api.post(`/cards/${cardId}/labels/${labelId}`).then(r => r.data);
export const toggleMember = (cardId, userId) => api.post(`/cards/${cardId}/members/${userId}`).then(r => r.data);
export const addChecklistItem = (cardId, data) => api.post(`/cards/${cardId}/checklist`, data).then(r => r.data);
export const updateChecklistItem = (cardId, itemId, data) => api.put(`/cards/${cardId}/checklist/${itemId}`, data).then(r => r.data);
export const deleteChecklistItem = (cardId, itemId) => api.delete(`/cards/${cardId}/checklist/${itemId}`).then(r => r.data);

// Users & Labels
export const getUsers = () => api.get('/users').then(r => r.data);
export const getBoardLabels = (boardId) => api.get(`/boards/${boardId}/labels`).then(r => r.data);
export const createLabel = (boardId, data) => api.post(`/boards/${boardId}/labels`, data).then(r => r.data);
