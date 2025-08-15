import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Check if we're running in Electron environment
if (!window.electronAPI) {
  console.info('Running in web mode. Some features may be limited compared to the desktop version.');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);