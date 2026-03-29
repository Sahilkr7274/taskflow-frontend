import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BoardProvider } from './context/BoardContext';
import Home from './pages/Home';
import Board from './pages/Board';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/board/:id" element={
          <BoardProvider>
            <Board />
          </BoardProvider>
        } />
      </Routes>
    </BrowserRouter>
  );
}
