import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { SoundProvider } from './context/SoundContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { MessagingProvider } from './context/MessagingContext.jsx';
import App from './App.jsx';
import './styles/globals.css';
import './styles/animations.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <SoundProvider>
            <ToastProvider>
              <MessagingProvider>
                <App />
              </MessagingProvider>
            </ToastProvider>
          </SoundProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
