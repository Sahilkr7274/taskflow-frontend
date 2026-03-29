import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// StrictMode removed — @hello-pangea/dnd breaks with React 19 StrictMode double-invoke
createRoot(document.getElementById('root')).render(<App />);
