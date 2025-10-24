<template>
  <div v-if="categories.length" class="category-buttons">
    <button 
      v-for="category in categories" 
      :key="category.id"
      class="category-btn"
      :class="{ active: activeCategory === category.id }"
      @click="scrollToCategory(category.id)"
    >
      {{ category.name }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useBookmarks } from '../composables/useBookmarks'

const { categories } = useBookmarks()
const activeCategory = ref(null)

const scrollToCategory = (categoryId) => {
  const element = document.getElementById(`category-${categoryId}`)
  if (element) {
    const offset = 120
    const top = element.getBoundingClientRect().top + window.scrollY - offset
    window.scrollTo({ top, behavior: 'smooth' })
  }
}

const updateActiveCategory = () => {
  const sections = document.querySelectorAll('.category-section')
  const scrollY = window.scrollY + 150
  
  for (const section of sections) {
    const top = section.offsetTop
    const height = section.offsetHeight
    
    if (scrollY >= top && scrollY < top + height) {
      const id = parseInt(section.id.replace('category-', ''))
      activeCategory.value = id
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveCategory)
  updateActiveCategory()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveCategory)
})
</script>

