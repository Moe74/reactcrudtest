import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// @Aytac: die Bibliothek Global State habe ich bereits installiert !!!

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);