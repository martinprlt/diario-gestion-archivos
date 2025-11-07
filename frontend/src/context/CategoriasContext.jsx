// 📁 src/context/CategoriasContext.jsx - CORREGIDO
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { API_URL } from '../config/api';

const CategoriasContext = createContext();

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
      setError(null);
      
      console.log('🚀 Cargando categorías desde:', `${API_URL}/api/categorias`);
      
      // ✅ USAR FETCH DIRECTAMENTE (sin apiFetch)
      const response = await fetch(`${API_URL}/api/categorias`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // ⚠️ NO incluir Authorization - categorías es pública
        },
      });

      console.log('📡 Status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Categorías cargadas:', data.length, 'elementos');
      
      setCategorias(data);
      return data;
      
    } catch (err) {
      console.error('❌ Error cargando categorías:', err);
      setError(err.message);
      
      // Fallback por si acaso
      const fallback = [
        { id_categoria: 1, nombre: "Política" },
        { id_categoria: 2, nombre: "Deportes" },
        { id_categoria: 3, nombre: "Economía" },
        { id_categoria: 4, nombre: "Cultura" },
        { id_categoria: 5, nombre: "Tecnología" },
        { id_categoria: 6, nombre: "Sociedad" },
        { id_categoria: 7, nombre: "Internacional" },
        { id_categoria: 8, nombre: "Salud" },
        { id_categoria: 9, nombre: "Educación" },
        { id_categoria: 10, nombre: "Entretenimiento" }
      ];
      
      console.warn('⚠️ Usando categorías de fallback');
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

export default CategoriasContext;