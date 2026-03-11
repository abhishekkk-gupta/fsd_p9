import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global resets
const style = document.createElement('style');
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
         background: #f0f4ff; color: #212529; }
  a { color: inherit; }
  td, th { padding: 10px 14px; text-align: left; }
`;
document.head.appendChild(style);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);