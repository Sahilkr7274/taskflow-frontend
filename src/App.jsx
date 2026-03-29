import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { BoardProvider } from './context/BoardContext';
import { NavProvider } from './context/NavContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import HomeDashboard from './pages/HomeDashboard';
import BoardsPage from './pages/BoardsPage';
import MembersPage from './pages/MembersPage';
import HighlightsPage from './pages/HighlightsPage';
import WorkspaceBoardsPage from './pages/workspace/WorkspaceBoardsPage';
import WorkspaceMembersPage from './pages/workspace/WorkspaceMembersPage';
import WorkspaceHighlightsPage from './pages/workspace/WorkspaceHighlightsPage';
import Board from './pages/Board';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <NavProvider>
          <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
          <Routes>
          {/* All pages that share the Navbar + Sidebar shell */}
          <Route element={<AppLayout />}>
            <Route path="/"        element={<Home />} />
            <Route path="/home"    element={<HomeDashboard />} />
            <Route path="/boards"  element={<BoardsPage />} />
            <Route path="/members" element={<MembersPage />} />
            <Route path="/workspace/:workspaceId/boards"     element={<WorkspaceBoardsPage />} />
            <Route path="/workspace/:workspaceId/members"    element={<WorkspaceMembersPage />} />
            <Route path="/workspace/:workspaceId/highlights" element={<WorkspaceHighlightsPage />} />
          </Route>

          {/* Board page has its own full-screen layout */}
          <Route path="/board/:id" element={
            <BoardProvider>
              <Board />
            </BoardProvider>
          } />
        </Routes>
        </NavProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
