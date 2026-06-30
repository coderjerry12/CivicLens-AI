import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { checkEnvOnStartup } from './lib/env';
import './styles/index.css';

// Validate environment variables in development
checkEnvOnStartup();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
