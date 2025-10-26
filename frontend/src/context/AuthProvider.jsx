//context/authprovider.jsx
import React, { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('usuario');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      try {
        setUsuario(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error("Error parsing stored user data:", error);
        logout();
      }
    }
  }, []);

  const login = (userData, authToken) => {
    if (!userData || !authToken) {
      console.error("Login requires both userData and authToken");
      return;
    }

    const userToStore = {
      id_usuario: userData.id_usuario,
      nombre: userData.nombre,
      apellido: userData.apellido,
      email: userData.email,
      categoria: userData.categoria || userData.rol,
      avatar_url: userData.avatar_url // Añade esto si es relevante
    };

    try {
      localStorage.setItem('usuario', JSON.stringify(userToStore));
      localStorage.setItem('token', authToken);
      setUsuario(userToStore);
      setToken(authToken);
    } catch (error) {
      console.error("Error saving auth data to localStorage:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    setUsuario(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ usuario, token, setUsuario, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
