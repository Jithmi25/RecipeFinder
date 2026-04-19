import { Router } from "express";
import { searchRecipes } from "../controllers/recipeController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();
router.get("/search", authenticateToken, searchRecipes);

export default router;
