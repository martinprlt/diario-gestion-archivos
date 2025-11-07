// 📁 src/context/CategoriasContext.jsx - CORREGIDO
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { apiFetch, apiEndpoints } from '../config/api';

const CategoriasContext = createContext();

// ✅ PRIMERO el hook - para Fast Refresh
export const useCategorias = () => {
  const context = useContext(CategoriasContext);
  if (!context) {
    throw new Error('useCategorias debe usarse dentro de CategoriasProvider');
  }
  return context;
};

// ✅ LUEGO el provider
export const CategoriasProvider = ({ children }) => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarCategorias = useCallback(async () => {
    try {
      setLoading(true);
      
      // ✅ CORREGIDO: usar 'categorias' en lugar de 'categories'
      const response = await apiFetch(apiEndpoints.categorias);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setCategorias(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('❌ Error cargando categorías:', err);
      setError(err.message);
      
      // Datos de fallback
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

// ✅ Export default opcional para evitar warnings
export default CategoriasContext;