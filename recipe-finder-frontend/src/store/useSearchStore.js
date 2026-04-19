import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "./useAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const useSearchStore = defineStore("search", {
  state: () => ({
    recipes: [],
    ingredients: [],
  }),
  actions: {
    async searchRecipes(query) {
      const authStore = useAuthStore();

      if (!authStore.token) {
        this.recipes = [];
        return;
      }

      try {
        const res = await axios.get(`${API_BASE_URL}/api/recipes/search`, {
          params: { q: query },
          headers: {
            Authorization: `Bearer ${authStore.token}`,
          },
        });
        this.recipes = res.data;
      } catch (err) {
        console.error("Error fetching recipes:", err);
      }
    },
    addIngredient(ingredient) {
      this.ingredients.push(ingredient);
    },
    removeIngredient(index) {
      this.ingredients.splice(index, 1);
    },
  },
});
