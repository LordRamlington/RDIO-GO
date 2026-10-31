import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
// Suppress unhandled TagError from external Google AdSense scripts if container layout is pending
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (
      event.message &&
      (event.message.includes('adsbygoogle') ||
        event.message.includes('TagError') ||
        event.message.includes('availableWidth'))
    ) {
      event.preventDefault();
      console.warn('Handled external ad notice:', event.message);
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
