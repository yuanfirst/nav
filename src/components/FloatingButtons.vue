<template>
  <div class="floating-buttons">
    <!-- 回到顶部按钮 -->
    <Transition name="fade">
      <button v-if="showBackToTop" class="floating-btn" @click="scrollToTop" title="回到顶部">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M12 19V5M5 12l7-7 7 7"/>
        </svg>
      </button>
    </Transition>
    
    <!-- 主题切换按钮 -->
    <button class="floating-btn theme-btn" @click="toggleTheme" title="切换主题">
      <svg v-if="isDark" viewBox="0 0 24 24" fill="currentColor">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <circle cx="12" cy="12" r="5"/>
        <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useTheme } from '../composables/useTheme'

const { isDark, toggleTheme } = useTheme()
const showBackToTop = ref(false)

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

