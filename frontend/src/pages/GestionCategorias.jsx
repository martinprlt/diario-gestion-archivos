// 📁 src/pages/GestionCategorias.jsx
import React from 'react';
import { useCategorias } from '../context/CategoriasContext.jsx'; // 👈 IMPORTAR EL CONTEXT
import CategoriaForm from '../components/CategoriaForm';
import CategoriaTable from '../components/CategoriaTable';
import '../assets/styles/gestionCategorias.css';

export default function GestionCategorias() {
  const { categorias, recargarCategorias } = useCategorias(); // 👈 USAR EL CONTEXTO

  // 🔹 Agregar categoría con sincronización automática
  const addCategoria = async (categoria) => {
    try {
      const res = await fetch('http://localhost:5000/api/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoria)
      });

      const result = await res.json();

      if (res.ok) {
        await recargarCategorias(); // 🔹 Actualizar el Context global
        alert('✅ Categoría creada exitosamente - Ya está disponible en toda la aplicación');
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error agregando categoría:', error);
      alert('❌ Error al agregar categoría');
    }
  };

  // 🔹 Eliminar categoría con sincronización
  const deleteCategoria = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/categorias/${id}`, {
        method: 'DELETE'
      });

      const result = await res.json();

      if (res.ok) {
        await recargarCategorias(); // 🔹 Actualizar el Context global
        alert('✅ Categoría eliminada exitosamente');
      } else {
        alert(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error eliminando categoría:', error);
      alert('❌ Error al eliminar categoría');
    }
  };

  return (
    <div className="gestion-categorias-container">
      <h1>Gestión de Categorías</h1>

      <div className="categorias-info">
        <p>📋 Total de categorías: <strong>{categorias.length}</strong></p>
        <p>🔄 Los cambios se reflejan inmediatamente en toda la aplicación</p>
      </div>

      <CategoriaForm onAdd={addCategoria} />
      <CategoriaTable categorias={categorias} onDelete={deleteCategoria} />
    </div>
  );
}
