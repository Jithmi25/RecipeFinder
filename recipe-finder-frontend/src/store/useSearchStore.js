import { defineStore } from "pinia";
import axios from "axios";
import { useAuthStore } from "./useAuthStore";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const useSearchStore = defineStore("search", {
  state: () => ({
    recipes: [],
    dietTypes: [],
    searchQuery: "",
    selectedDiets: [],
    currentPage: 0,
    pageSize: 12,
    total: 0,
    hasMore: false,
    isLoading: false,
    error: "",
    searchHistory: JSON.parse(localStorage.getItem("searchHistory") || "[]"),
    lastSearch: null,
  }),

  getters: {
    totalPages: (state) => Math.ceil(state.total / state.pageSize),
    currentPageNo: (state) => state.currentPage / state.pageSize + 1,
    isEmpty: (state) =>
      !state.isLoading && state.recipes.length === 0 && state.lastSearch,
  },

  actions: {
    clearError() {
      this.error = "";
    },

    setSelectedDiets(diets) {
      this.selectedDiets = diets;
      this.currentPage = 0;
    },

    addToSearchHistory(query) {
      if (!query || this.searchHistory.includes(query)) return;
      this.searchHistory.unshift(query);
      if (this.searchHistory.length > 10) {
        this.searchHistory.pop();
      }
      localStorage.setItem("searchHistory", JSON.stringify(this.searchHistory));
    },

    goToPage(pageNo) {
      this.currentPage = (pageNo - 1) * this.pageSize;
    },

    nextPage() {
      if (this.hasMore) {
        this.currentPage += this.pageSize;
      }
    },

    prevPage() {
      if (this.currentPage > 0) {
        this.currentPage -= this.pageSize;
      }
    },

    async fetchDietTypes() {
      try {
        const authStore = useAuthStore();
        const response = await axios.get(
          `${API_BASE_URL}/api/recipes/diets`,
          {
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );
        this.dietTypes = response.data;
      } catch (err) {
        console.error("Error fetching diet types:", err);
      }
    },

    async searchRecipes(query) {
      if (!query.trim()) {
        this.recipes = [];
        this.lastSearch = null;
        this.error = "";
        return;
      }

      this.searchQuery = query;
      this.currentPage = 0;
      this.lastSearch = { query, diets: [...this.selectedDiets] };
      this.addToSearchHistory(query);

      await this._performSearch();
    },

    async _performSearch() {
      const authStore = useAuthStore();

      if (!authStore.token) {
        this.error = "Authentication required";
        this.recipes = [];
        return;
      }

      this.isLoading = true;
      this.clearError();

      try {
        const params = {
          q: this.searchQuery,
          limit: this.pageSize,
          offset: this.currentPage,
        };

        if (this.selectedDiets.length > 0) {
          params.diets = this.selectedDiets.join(",");
        }

        const response = await axios.get(
          `${API_BASE_URL}/api/recipes/search`,
          {
            params,
            headers: {
              Authorization: `Bearer ${authStore.token}`,
            },
          }
        );

        this.recipes = response.data.data;
        this.total = response.data.pagination.total;
        this.hasMore = response.data.pagination.hasMore;
      } catch (err) {
        this.error =
          err?.response?.data?.error ||
          "Failed to fetch recipes. Please try again.";
        this.recipes = [];
      } finally {
        this.isLoading = false;
      }
    },

    async applyFilters() {
      this.currentPage = 0;
      if (this.searchQuery) {
        await this._performSearch();
      }
    },
  },
});
