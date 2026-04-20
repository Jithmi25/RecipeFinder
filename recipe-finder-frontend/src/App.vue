<template>
  <div class="app-shell">
    <section v-if="!authStore.isAuthenticated" class="auth-card">
      <p class="kicker">Day 1: Authentication Foundation</p>
      <h1>Recipe Finder</h1>
      <p class="subtitle">Sign in with Google to continue to recipe search.</p>
      <div v-if="authStore.error" class="alert">{{ authStore.error }}</div>
      <div v-if="!hasGoogleClientId" class="alert warning">
        Missing VITE_GOOGLE_CLIENT_ID in frontend env.
      </div>
      <div id="google-signin-button" class="google-button-slot"></div>
    </section>

    <section v-else class="app-card">
      <header class="app-header">
        <div>
          <p class="kicker">Signed in as</p>
          <h2>{{ authStore.user?.name }}</h2>
          <p class="email">{{ authStore.user?.email }}</p>
        </div>
        <button class="sign-out" @click="logout">Sign out</button>
      </header>

      <h1 class="title">🍲 Recipe Finder</h1>

      <SearchBar @search="onSearch" />

      <FilterBar
        v-if="searchStore.dietTypes.length > 0"
        @filter-changed="onFilterChanged"
        @clear-filters="onClearFilters"
      />

      <LoadingState v-if="searchStore.isLoading" />
      <ErrorState
        v-else-if="searchStore.error"
        :message="searchStore.error"
        @retry="onRetry"
      />
      <EmptyState
        v-else-if="searchStore.isEmpty"
        title="No recipes found"
        message="Try adjusting your filters or search terms."
      />
      <div v-else-if="searchStore.recipes.length > 0">
        <div class="recipes-grid">
          <RecipeCard
            v-for="recipe in searchStore.recipes"
            :key="recipe.id"
            :recipe="recipe"
          />
        </div>

        <Pagination
          :current-page-no="searchStore.currentPageNo"
          :total-pages="searchStore.totalPages"
          :total="searchStore.total"
          :has-more="searchStore.hasMore"
          @prev="searchStore.prevPage(); performSearch()"
          @next="searchStore.nextPage(); performSearch()"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, nextTick, onMounted } from "vue";
import SearchBar from "./components/SearchBar.vue";
import FilterBar from "./components/FilterBar.vue";
import RecipeCard from "./components/RecipeCard.vue";
import LoadingState from "./components/LoadingState.vue";
import EmptyState from "./components/EmptyState.vue";
import ErrorState from "./components/ErrorState.vue";
import Pagination from "./components/Pagination.vue";
import { useSearchStore } from "./store/useSearchStore";
import { useAuthStore } from "./store/useAuthStore";

const searchStore = useSearchStore();
const authStore = useAuthStore();
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const hasGoogleClientId = computed(() => Boolean(googleClientId));

function logout() {
  authStore.logout();
  searchStore.recipes = [];
  searchStore.lastSearch = null;
  searchStore.searchQuery = "";
  nextTick(() => {
    initializeGoogleButton();
  });
}

async function onSearch() {
  await performSearch();
}

async function onFilterChanged() {
  await searchStore.applyFilters();
}

function onClearFilters() {
  searchStore.setSelectedDiets([]);
  searchStore.applyFilters();
}

async function onRetry() {
  await performSearch();
}

async function performSearch() {
  await searchStore._performSearch();
}

function initializeGoogleButton(retryCount = 0) {
  if (!hasGoogleClientId.value || authStore.isAuthenticated) {
    return;
  }

  const googleApi = window.google?.accounts?.id;
  if (!googleApi) {
    if (retryCount < 20) {
      setTimeout(() => initializeGoogleButton(retryCount + 1), 200);
    }
    return;
  }

  googleApi.initialize({
    client_id: googleClientId,
    callback: async (response) => {
      if (!response?.credential) {
        return;
      }
      await authStore.loginWithGoogleCredential(response.credential);
      nextTick(() => {
        searchStore.fetchDietTypes();
      });
    },
  });

  googleApi.renderButton(document.getElementById("google-signin-button"), {
    theme: "filled_blue",
    size: "large",
    text: "signin_with",
    shape: "pill",
    width: 300,
  });
}

onMounted(() => {
  if (authStore.isAuthenticated) {
    searchStore.fetchDietTypes();
  } else {
    initializeGoogleButton();
  }
});
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.auth-card,
.app-card {
  width: min(1000px, 100%);
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 20px 60px rgba(15, 23, 42, 0.1);
  padding: 32px;
}

.auth-card {
  max-width: 520px;
  text-align: center;
}

.kicker {
  margin: 0 0 8px;
  color: #0c4a6e;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

h1,
h2 {
  margin: 0;
}

.subtitle,
.email {
  color: #475569;
}

.google-button-slot {
  margin-top: 18px;
  display: flex;
  justify-content: center;
}

.alert {
  margin-top: 14px;
  border-radius: 12px;
  padding: 10px;
  font-size: 0.9rem;
  color: #991b1b;
  background: #fee2e2;
}

.alert.warning {
  color: #7c2d12;
  background: #ffedd5;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 28px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.title {
  margin: 0 0 24px 0;
  font-size: 2rem;
}

.sign-out {
  border: none;
  background: #0f172a;
  color: #f8fafc;
  border-radius: 999px;
  padding: 10px 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sign-out:hover {
  background: #334155;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 28px;
}

@media (max-width: 700px) {
  .auth-card,
  .app-card {
    padding: 22px;
  }

  .app-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .recipes-grid {
    grid-template-columns: 1fr;
  }

  .title {
    font-size: 1.5rem;
  }
}
</style>
