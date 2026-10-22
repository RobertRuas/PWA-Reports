import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export type ThemePreference = 'light' | 'dark' | 'system'

export const usePreferencesStore = defineStore('preferences', () => {
  const theme = ref<ThemePreference>(loadTheme())

  function loadTheme(): ThemePreference {
    try {
      const saved = localStorage.getItem('pwa-starter-theme')
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
    } catch {
      // localStorage indisponível
    }
    return 'light'
  }

  function applyTheme(value: ThemePreference) {
    const root = document.documentElement
    let isDark = false
    if (value === 'system') {
      isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    } else {
      isDark = value === 'dark'
    }
    root.classList.toggle('p-dark', isDark)
  }

  function setTheme(value: ThemePreference) {
    theme.value = value
    try {
      localStorage.setItem('pwa-starter-theme', value)
    } catch {
      // falha silenciosa
    }
    applyTheme(value)
  }

  applyTheme(theme.value)

  watch(theme, applyTheme)

  return { theme, setTheme }
})
