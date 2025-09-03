<template>
  <div class="recipe-card">
    <h3>{{ recipe.title }}</h3>
    <p><strong>Ingredients:</strong> {{ recipe.ingredients.join(', ') }}</p>
    <p><strong>Instructions:</strong> {{ recipe.instructions }}</p>
  </div>
</template>

<script setup>
defineProps({
  recipe: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.recipe-card {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 6px;
  background: white;
}
</style>
