import axios from "axios";

const baseUrl =
  process.env.THEMEALDB_BASE_URL || "https://www.themealdb.com/api/json/v1/1";
const apiKey = process.env.THEMEALDB_API_KEY || "1";

function endpoint(path) {
  const sanitizedBase = String(baseUrl).replace(/\/+$/, "");

  // Support both forms:
  // 1) https://www.themealdb.com/api/json/v1/1
  // 2) https://www.themealdb.com/api/json/v1   (apiKey appended)
  if (/\/api\/json\/v1\/[^/]+$/i.test(sanitizedBase)) {
    return `${sanitizedBase}/${path}`;
  }

  return `${sanitizedBase}/${apiKey}/${path}`;
}

export async function fetchMealsBySearch(query) {
  const response = await axios.get(endpoint("search.php"), {
    params: { s: query || "" },
    timeout: 10000,
  });

  return response.data?.meals || [];
}

export async function fetchMealById(id) {
  const response = await axios.get(endpoint("lookup.php"), {
    params: { i: id },
    timeout: 10000,
  });

  const meals = response.data?.meals || [];
  return meals[0] || null;
}

export async function fetchCategories() {
  const response = await axios.get(endpoint("categories.php"), {
    timeout: 10000,
  });

  return response.data?.categories || [];
}

export async function fetchMealsByCategory(categoryName) {
  const response = await axios.get(endpoint("filter.php"), {
    params: { c: categoryName },
    timeout: 10000,
  });

  return response.data?.meals || [];
}

export async function fetchIngredientsList() {
  const response = await axios.get(endpoint("list.php"), {
    params: { i: "list" },
    timeout: 10000,
  });

  return response.data?.meals || [];
}
