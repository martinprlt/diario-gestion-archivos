// backend/src/routes/categoria.routes.js - VERIFICAR ESTO
import express from 'express';
import { 
  getCategorias, 
  createCategoria, 
  deleteCategoria, 
  updateCategoria 
} from '../controllers/categoria.controller.js';

const router = express.Router();

// ✅ Rutas públicas (GET no requiere auth para que el frontend cargue)
router.get('/', getCategorias);

// ✅ Rutas protegidas (requieren autenticación - opcional)
// Si quieres protegerlas, importa verifyToken y úsalo:
// import { verifyToken } from '../middlewares/auth.middleware.js';
// router.post('/', verifyToken, createCategoria);

router.post('/', createCategoria);
router.delete('/:id', deleteCategoria);
router.put('/:id', updateCategoria);

// ✅ Agregar logging para debug
console.log('📁 Rutas de categorías registradas:');
console.log('   GET    /api/categorias');
console.log('   POST   /api/categorias');
console.log('   DELETE /api/categorias/:id');
console.log('   PUT    /api/categorias/:id');

export default router;