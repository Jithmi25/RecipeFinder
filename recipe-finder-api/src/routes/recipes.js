import { Router } from "express";
import {
  searchRecipes,
  getDiets,
  getIngredientsList,
  getRecipeById
} from '../controllers/recipeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/search', authenticateToken, searchRecipes);
router.get('/diets', authenticateToken, getDiets);
router.get('/ingredients', authenticateToken, getIngredientsList);
router.get('/:id', authenticateToken, getRecipeById);

export default router;
