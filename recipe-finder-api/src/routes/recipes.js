import { Router } from 'express';
import { searchRecipes } from '../controllers/recipeController.js';

const router = Router();
router.get('/search', searchRecipes);

export default router;
