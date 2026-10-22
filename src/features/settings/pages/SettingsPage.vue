<template>
  <div class="settings-page">
    <PageHeader :title="t('settings.title')" />

    <div class="settings-content">
      <!-- Language Settings -->
      <Card>
        <template #title>
          <i class="pi pi-globe" style="margin-right: 0.5rem;"></i>
          {{ t('settings.language') }}
        </template>
        <template #content>
          <div class="setting-group">
            <label>{{ t('settings.chooseLanguage') }}</label>
            <Dropdown
              :options="languages"
              option-label="label"
              option-value="value"
              :model-value="i18nStore.locale"
              @update:model-value="changeLanguage"
            />
            <p class="hint">{{ t('settings.languageHint') }}</p>
          </div>
        </template>
      </Card>

      <!-- Theme Settings -->
      <Card>
        <template #title>
          <i class="pi pi-palette" style="margin-right: 0.5rem;"></i>
          {{ t('settings.theme') }}
        </template>
        <template #content>
          <div class="setting-group">
            <label>{{ t('settings.themeMode') }}</label>
            <div class="theme-buttons">
              <Button
                :label="t('settings.light')"
                :severity="isDarkMode ? 'secondary' : 'primary'"
                :icon="isDarkMode ? '' : 'pi pi-check'"
                @click="setTheme('light')"
              />
              <Button
                :label="t('settings.dark')"
                :severity="isDarkMode ? 'primary' : 'secondary'"
                :icon="isDarkMode ? 'pi pi-check' : ''"
                @click="setTheme('dark')"
              />
              <Button
                :label="t('settings.auto')"
                :severity="themeMode === 'auto' ? 'primary' : 'secondary'"
                :icon="themeMode === 'auto' ? 'pi pi-check' : ''"
                @click="setTheme('auto')"
              />
            </div>
            <p class="hint">{{ t('settings.themeHint') }}</p>
          </div>
        </template>
      </Card>

      <!-- Storage Info -->
      <Card>
        <template #title>
          <i class="pi pi-database" style="margin-right: 0.5rem;"></i>
          {{ t('settings.storage') }}
        </template>
        <template #content>
          <div class="storage-info">
            <div class="storage-row">
              <span>{{ t('settings.totalProjects') }}</span>
              <strong>{{ projectCount }}</strong>
            </div>
            <div class="storage-row">
              <span>{{ t('settings.totalPhotos') }}</span>
              <strong>{{ photoCount }}</strong>
            </div>
            <div class="storage-row">
              <span>{{ t('settings.dbSize') }}</span>
              <strong>{{ formatBytes(dbSize) }}</strong>
            </div>
            <Button
              :label="t('settings.clearCache')"
              severity="danger"
              icon="pi pi-trash"
              class="clear-btn"
              @click="clearCache"
            />
          </div>
        </template>
      </Card>

      <!-- About -->
      <Card>
        <template #title>
          <i class="pi pi-info-circle" style="margin-right: 0.5rem;"></i>
          {{ t('settings.about') }}
        </template>
        <template #content>
          <div class="about-info">
            <p><strong>PWA Reports</strong></p>
            <p>{{ t('settings.version') }}: v2.0.0</p>
            <p class="description">{{ t('settings.description') }}</p>
            <div class="features">
              <h4>{{ t('settings.features') }}:</h4>
              <ul>
                <li>{{ t('settings.feature1') }}</li>
                <li>{{ t('settings.feature2') }}</li>
                <li>{{ t('settings.feature3') }}</li>
                <li>{{ t('settings.feature4') }}</li>
              </ul>
            </div>
            <p class="hint" style="margin-top: 1rem;">
              <strong>{{ t('settings.offline') }}</strong>
            </p>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '../../../components/ui/PageHeader.vue'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'
import Button from 'primevue/button'
import { useI18nStore } from '../../../stores/i18n'
import { db } from '../../../core/database/db'

const i18nStore = useI18nStore()

const projectCount = ref(0)
const photoCount = ref(0)
const dbSize = ref(0)
const isDarkMode = ref(false)
const themeMode = ref<'light' | 'dark' | 'auto'>('auto')

const languages = [
  { label: 'Português', value: 'pt' },
  { label: 'English', value: 'en' },
]

const t = (key: string) => {
  const keys = key.split('.')
  let obj: any = i18nStore.translations[i18nStore.locale]
  for (const k of keys) {
    obj = obj?.[k]
  }
  return obj || key
}

const changeLanguage = (lang: string) => {
  if (lang === 'pt' || lang === 'en') {
    i18nStore.setLocale(lang)
  }
}

const setTheme = (mode: 'light' | 'dark' | 'auto') => {
  themeMode.value = mode
  localStorage.setItem('theme-mode', mode)

  if (mode === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
    document.documentElement.removeAttribute('data-theme')
  } else if (mode === 'dark') {
    isDarkMode.value = true
    document.documentElement.setAttribute('data-theme', 'dark')
  } else {
    isDarkMode.value = false
    document.documentElement.setAttribute('data-theme', 'light')
  }
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const calculateStorageSize = async () => {
  try {
    const projects = await db.projects.toArray()
    const photos = await db.photos.toArray()

    projectCount.value = projects.length
    photoCount.value = photos.length

    // Estimate size
    let size = 0
    projects.forEach(p => {
      size += JSON.stringify(p).length
    })
    photos.forEach(p => {
      size += p.data?.size || 0
    })

    dbSize.value = size
  } catch (err) {
    console.error('Erro ao calcular storage:', err)
  }
}

const clearCache = async () => {
  if (confirm(t('settings.confirmClearCache'))) {
    try {
      await db.photos.clear()
      await db.projects.clear()
      projectCount.value = 0
      photoCount.value = 0
      dbSize.value = 0
      alert(t('settings.cacheCleared'))
    } catch (err) {
      console.error('Erro ao limpar cache:', err)
      alert(t('settings.errorClearingCache'))
    }
  }
}

onMounted(() => {
  // Load theme preference
  const savedTheme = localStorage.getItem('theme-mode') as 'light' | 'dark' | 'auto' | null
  themeMode.value = savedTheme || 'auto'

  if (themeMode.value === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDarkMode.value = prefersDark
  } else {
    isDarkMode.value = themeMode.value === 'dark'
  }

  // Calculate storage
  calculateStorageSize()
})
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.settings-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
  max-width: 600px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.setting-group label {
  font-weight: 500;
  color: var(--p-text-color);
  font-size: 0.95rem;
}

.hint {
  font-size: 0.85rem;
  color: var(--p-text-color-secondary);
  margin: 0;
}

.theme-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

:deep(.theme-buttons .p-button) {
  height: 44px;
  font-size: 0.9rem;
}

.storage-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.storage-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--p-surface-50);
  border-radius: var(--p-border-radius);
}

.storage-row span {
  color: var(--p-text-color-secondary);
}

.storage-row strong {
  color: var(--p-primary-color);
  font-size: 1.1rem;
}

.clear-btn {
  width: 100%;
  margin-top: 1rem;
}

.about-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.about-info p {
  margin: 0.25rem 0;
  color: var(--p-text-color);
}

.about-info strong {
  color: var(--p-text-color);
}

.description {
  font-size: 0.9rem;
  color: var(--p-text-color-secondary);
  margin: 0.5rem 0;
}

.features {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--p-surface-50);
  border-radius: var(--p-border-radius);
}

.features h4 {
  margin: 0 0 0.5rem 0;
  color: var(--p-text-color);
  font-size: 0.95rem;
}

.features ul {
  margin: 0;
  padding-left: 1.5rem;
  color: var(--p-text-color-secondary);
  font-size: 0.9rem;
}

.features li {
  margin: 0.25rem 0;
}
</style>
