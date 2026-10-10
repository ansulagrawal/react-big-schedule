import { createRoot } from 'react-dom/client';
import App from './app';

// Library style (built by Tailwind CLI from src/css/style.css)
import './generated.css';

createRoot(document.getElementById('root') as HTMLElement).render(<App />);
