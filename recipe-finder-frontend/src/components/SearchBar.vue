<template>
  <div class="search-bar">
    <input
      v-model="query"
      type="text"
      placeholder="Search recipes..."
      @keyup.enter="search"
    />
    <button @click="search">Search</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSearchStore } from '../store/useSearchStore'

const query = ref('')
const searchStore = useSearchStore()

function search() {
  if (query.value.trim()) {
    searchStore.searchRecipes(query.value)
    query.value = ''
  }
}
</script>

<style scoped>
.search-bar {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}
input {
  padding: 8px;
  width: 60%;
}
button {
  padding: 8px 12px;
  background: #007bff;
  border: none;
  color: white;
  cursor: pointer;
}
button:hover {
  background: #0056b3;
}
</style>
