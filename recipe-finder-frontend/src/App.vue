<template>
  <div class="container">
    <h1>🍲 Recipe Finder</h1>
    <SearchBar />
    <IngredientInput />
    <div class="recipes">
      <RecipeCard
        v-for="recipe in searchStore.recipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </div>
  </div>
</template>

<script setup>
import SearchBar from './components/SearchBar.vue'
import IngredientInput from './components/IngredientInput.vue'
import RecipeCard from './components/RecipeCard.vue'
import { useSearchStore } from './store/useSearchStore'

const searchStore = useSearchStore()
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background: #f8f9fa;
  margin: 0;
  padding: 0;
}
.container {
  width: 800px;
  margin: auto;
  padding: 20px;
}
h1 {
  text-align: center;
}
.recipes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 20px;
}
</style>
