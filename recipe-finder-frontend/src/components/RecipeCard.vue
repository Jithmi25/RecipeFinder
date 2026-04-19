<template>
  <div class="recipe-card">
    <h3>{{ recipe.title }}</h3>
    <p><strong>Ingredients:</strong> {{ ingredientsText }}</p>
    <p><strong>Instructions:</strong> {{ recipe.instructions }}</p>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  recipe: {
    type: Object,
    required: true,
  },
});

const ingredientsText = computed(() => {
  const value = props.recipe.ingredients;

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.join(", ");
      }
    } catch {
      return value;
    }
    return value;
  }

  return "Not available";
});
</script>

<style scoped>
.recipe-card {
  border: 1px solid #ccc;
  padding: 15px;
  border-radius: 6px;
  background: white;
}
</style>
