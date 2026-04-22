import { getFirestore } from "../firebaseAdmin.js";
import {
  fetchCategories,
  fetchIngredientsList,
  fetchMealById,
  fetchMealsByCategory,
  fetchMealsBySearch,
} from "../services/theMealDbService.js";

const FAVORITES_COLLECTION = "user_favorites";

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function extractIngredients(meal) {
  const items = [];

  for (let i = 1; i <= 20; i += 1) {
    const ingredient = meal[`strIngredient${i}`]?.trim();
    const quantity = meal[`strMeasure${i}`]?.trim();

    if (!ingredient) {
      continue;
    }

    items.push({
      name: ingredient,
      quantity: quantity || "",
    });
  }

  return items;
}

function normalizeMealSummary(meal) {
  const mealId = Number(meal.idMeal);
  const category = meal.strCategory || "";
  const area = meal.strArea || "";
  const description = [category, area].filter(Boolean).join(" • ");

  return {
    id: Number.isNaN(mealId) ? meal.idMeal : mealId,
    title: meal.strMeal || "Untitled Meal",
    slug: slugify(meal.strMeal),
    description,
    instructions: meal.strInstructions || "",
    prep_minutes: null,
    cook_minutes: null,
    servings: null,
    popularity: 0,
    diet_types: category || "",
    image_url: meal.strMealThumb || "",
  };
}

function normalizeMealDetails(meal) {
  return {
    ...normalizeMealSummary(meal),
    ingredients: extractIngredients(meal),
  };
}

async function resolveCategoryNames(categoryKeys) {
  if (!categoryKeys || categoryKeys.length === 0) {
    return [];
  }

  const categories = await fetchCategories();
  const byKey = new Map(
    categories.map((item) => [slugify(item.strCategory), item.strCategory]),
  );

  return categoryKeys
    .map((key) => byKey.get(key) || null)
    .filter((value) => Boolean(value));
}

async function getMealsFromCategoryFilters(categoryNames) {
  if (!categoryNames || categoryNames.length === 0) {
    return [];
  }

  const grouped = await Promise.all(
    categoryNames.map((name) => fetchMealsByCategory(name)),
  );

  const unique = new Map();
  grouped.flat().forEach((meal) => {
    unique.set(meal.idMeal, meal);
  });

  return [...unique.values()];
}

export async function getDietTypes() {
  const categories = await fetchCategories();

  return categories.map((item, index) => ({
    id: index + 1,
    key_name: slugify(item.strCategory),
    display_name: item.strCategory,
  }));
}

export async function getIngredients(limit = 20) {
  const ingredients = await fetchIngredientsList();

  return ingredients.slice(0, limit).map((item, index) => ({
    id: index + 1,
    name: item.strIngredient,
    normalized_name: String(item.strIngredient || "").toLowerCase(),
  }));
}

export async function getRecipes({ q, dietTypes, limit = 12, offset = 0 }) {
  const normalizedQuery = String(q || "").trim();
  const categoryNames = await resolveCategoryNames(dietTypes);

  let sourceMeals = [];

  if (normalizedQuery) {
    sourceMeals = await fetchMealsBySearch(normalizedQuery);
  }

  if (categoryNames.length > 0) {
    const categoryMeals = await getMealsFromCategoryFilters(categoryNames);

    if (normalizedQuery) {
      const categoryIds = new Set(categoryMeals.map((meal) => meal.idMeal));
      sourceMeals = sourceMeals.filter((meal) => categoryIds.has(meal.idMeal));
    } else {
      sourceMeals = categoryMeals;
    }
  }

  const sliced = sourceMeals.slice(offset, offset + limit);

  return sliced.map((meal) => {
    const normalized = normalizeMealSummary(meal);

    // Meals fetched from filter endpoint omit category/area/instructions.
    if (!meal.strCategory && categoryNames.length > 0) {
      normalized.diet_types = categoryNames.join(", ");
      normalized.description = categoryNames.join(" • ");
    }

    return normalized;
  });
}

export async function getRecipeCount({ q, dietTypes }) {
  const normalizedQuery = String(q || "").trim();
  const categoryNames = await resolveCategoryNames(dietTypes);

  let sourceMeals = [];

  if (normalizedQuery) {
    sourceMeals = await fetchMealsBySearch(normalizedQuery);
  }

  if (categoryNames.length > 0) {
    const categoryMeals = await getMealsFromCategoryFilters(categoryNames);

    if (normalizedQuery) {
      const categoryIds = new Set(categoryMeals.map((meal) => meal.idMeal));
      sourceMeals = sourceMeals.filter((meal) => categoryIds.has(meal.idMeal));
    } else {
      sourceMeals = categoryMeals;
    }
  }

  return sourceMeals.length;
}

export async function getRecipeDetails(id) {
  const meal = await fetchMealById(id);

  if (!meal) {
    return null;
  }

  return normalizeMealDetails(meal);
}

export async function getFavoriteRecipesByUser(userId) {
  const db = getFirestore();
  const snapshot = await db
    .collection(FAVORITES_COLLECTION)
    .where("userId", "==", userId)
    .get();

  const items = snapshot.docs.map((doc) => {
    const item = doc.data();
    return {
      ...item,
      image_url:
        item.image_url ||
        item.imageUrl ||
        item.image ||
        item.thumbnail_url ||
        "",
    };
  });

  items.sort((a, b) => {
    const aTime = a.favoritedAt || "";
    const bTime = b.favoritedAt || "";
    return bTime.localeCompare(aTime);
  });

  return items;
}

export async function getFavoriteRecipeIdsByUser(userId) {
  const rows = await getFavoriteRecipesByUser(userId);
  return rows
    .map((item) => Number(item.id))
    .filter((id) => Number.isInteger(id));
}

export async function addFavoriteRecipe(userId, recipeId) {
  const details = await getRecipeDetails(recipeId);

  if (!details) {
    return false;
  }

  const db = getFirestore();
  const docId = `${userId}_${details.id}`;

  await db
    .collection(FAVORITES_COLLECTION)
    .doc(docId)
    .set({
      ...details,
      userId,
      favoritedAt: new Date().toISOString(),
    });

  return true;
}

export async function removeFavoriteRecipe(userId, recipeId) {
  const db = getFirestore();
  const docId = `${userId}_${recipeId}`;
  await db.collection(FAVORITES_COLLECTION).doc(docId).delete();
}
