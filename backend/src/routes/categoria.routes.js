import express from 'express';
import { 
  getCategorias, 
  createCategoria, 
  deleteCategoria, 
  updateCategoria 
} from '../controllers/categoria.controller.js';

const router = express.Router();

router.get('/', getCategorias);
router.post('/', createCategoria);
router.delete('/:id', deleteCategoria);
router.put('/:id', updateCategoria);

export default router;