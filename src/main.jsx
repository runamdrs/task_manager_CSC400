// Enable React's development checks for components rendered in this entry point.
import { StrictMode } from 'react';
// Import the React DOM API used to mount the application.
import { createRoot } from 'react-dom/client';
// Load the global stylesheet before rendering the application.
import './styles.css';
// Import the root application component.
import App from './App.jsx';

// Mount React into the root element declared in index.html.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Render the task manager with development-only Strict Mode checks. */}
    <App />
  </StrictMode>
);
