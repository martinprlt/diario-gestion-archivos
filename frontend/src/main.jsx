// 📁 main.jsx - VERSIÓN CORREGIDA
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './assets/styles/global.css';
import App from './App.jsx'
import { AuthProvider } from './context/AuthProvider';
import { CategoriasProvider } from './context/CategoriasContext.jsx';
import { BrowserRouter } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> 
      <AuthProvider>
        <CategoriasProvider> 
          <App />
        </CategoriasProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)