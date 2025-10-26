// 📁 src/context/CategoriasContext.jsx - VERSIÓN LIMPIA
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config/api.js'

const CategoriasContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useCategorias = () => {
  const context = useContext(CategoriasContext);
  if (!context) {
    throw new Error('useCategorias debe usarse dentro de CategoriasProvider');
  }
  return context;
};

export const CategoriasProvider = ({ children }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarCategorias = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/categorias`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCategorias(data);
      setError(null);
      return data;
    } catch (err) {
      setError(err.message);
      
      const fallback = [
        { id_categoria: 3, nombre: "Economía" },
        { id_categoria: 4, nombre: "Cultura" },
        { id_categoria: 5, nombre: "Tecnología" },
        { id_categoria: 6, nombre: "Sociedad" },
        { id_categoria: 7, nombre: "Internacional" },
        { id_categoria: 8, nombre: "Salud" },
        { id_categoria: 9, nombre: "Educación" },
        { id_categoria: 10, nombre: "Entretenimiento" }
      ];
      setCategorias(fallback);
      return fallback;
    } finally {
      setLoading(false);
    }
  }, []);

  const recargarCategorias = async () => {
    return await cargarCategorias();
  };

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const value = {
    categorias,
    loading,
    error,
    recargarCategorias
  };

  return (
    <CategoriasContext.Provider value={value}>
      {children}
    </CategoriasContext.Provider>
  );
};