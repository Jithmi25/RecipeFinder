<template>
  <div class="recipe-card">
    <div class="recipe-header">
      <h3>{{ recipe.title }}</h3>
      <div v-if="recipe.diet_types" class="diet-tags">
        <span
          v-for="diet in dietArray"
          :key="diet"
          class="diet-tag"
        >
          {{ diet }}
        </span>
      </div>
    </div>

    <p v-if="recipe.description" class="description">{{ recipe.description }}</p>

    <div class="recipe-meta">
      <div class="meta-item" v-if="recipe.prep_minutes">
        <span class="icon">⏱️</span>
        <span>{{ recipe.prep_minutes }}m prep</span>
      </div>
      <div class="meta-item" v-if="recipe.cook_minutes">
        <span class="icon">🍳</span>
        <span>{{ recipe.cook_minutes }}m cook</span>
      </div>
      <div class="meta-item" v-if="recipe.servings">
        <span class="icon">🍽️</span>
        <span>{{ recipe.servings }} servings</span>
      </div>
    </div>

    <div v-if="ingredientsText" class="ingredients-preview">
      <strong>Ingredients:</strong>
      <p>{{ ingredientsPreview }}</p>
    </div>
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

const dietArray = computed(() => {
  if (!props.recipe.diet_types) return [];
  if (typeof props.recipe.diet_types === "string") {
    return props.recipe.diet_types.split(",").map((d) => d.trim());
  }
  if (Array.isArray(props.recipe.diet_types)) {
    return props.recipe.diet_types;
  }
  return [];
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

  return "";
});

const ingredientsPreview = computed(() => {
  if (ingredientsText.value.length > 80) {
    return ingredientsText.value.substring(0, 80) + "...";
  }
  return ingredientsText.value;
});
</script>

<style scoped>
.recipe-card {
  border: 1px solid #e2e8f0;
  padding: 16px;
  border-radius: 8px;
  background: white;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.1);
  border-color: #0ea5e9;
}

.recipe-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

h3 {
  margin: 0;
  font-size: 1rem;
  color: #0f172a;
  flex: 1;
}

.diet-tags {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.diet-tag {
  display: inline-block;
  padding: 2px 6px;
  background: #dbeafe;
  color: #0c4a6e;
  font-size: 0.7rem;
  border-radius: 3px;
  font-weight: 600;
  white-space: nowrap;
}

.description {
  margin: 0;
  font-size: 0.85rem;
  color: #64748b;
  line-height: 1.4;
}

.recipe-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.85rem;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #475569;
}

.icon {
  font-size: 1rem;
}

.ingredients-preview {
  font-size: 0.8rem;
  color: #64748b;
  padding-top: 6px;
}

.ingredients-preview strong {
  color: #334155;
}

.ingredients-preview p {
  margin: 4px 0 0 0;
  line-height: 1.3;
}
</style>
