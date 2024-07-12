import { createRoot } from 'react-dom/client';
import { App } from 'application/components/App';
import './styles/main.scss';

const container = document.getElementById('root');
const root = createRoot(container as HTMLElement);
root.render(<App />);
