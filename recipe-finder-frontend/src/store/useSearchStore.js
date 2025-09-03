import { defineStore } from 'pinia'
import axios from 'axios'

export const useSearchStore = defineStore('search', {
  state: () => ({
    recipes: [],
    ingredients: []
  }),
  actions: {
    async searchRecipes(query) {
      try {
        const res = await axios.get(`http://localhost:5000/api/recipes/search?q=${query}`)
        this.recipes = res.data
      } catch (err) {
        console.error('Error fetching recipes:', err)
      }
    },
    addIngredient(ingredient) {
      this.ingredients.push(ingredient)
    },
    removeIngredient(index) {
      this.ingredients.splice(index, 1)
    }
  }
})
