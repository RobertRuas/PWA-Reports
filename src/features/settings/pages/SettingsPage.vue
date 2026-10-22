<template>
  <div class="settings-page">
    <div class="settings-content">
      <!-- Idioma - compacto -->
      <div class="settings-card">
        <div class="card-row">
          <div class="card-row-label">
            <i class="pi pi-globe"></i>
            <span>{{ t('settings.language') }}</span>
          </div>
          <Dropdown
            :options="languages"
            option-label="label"
            option-value="value"
            :model-value="i18nStore.locale"
            class="lang-dropdown"
            @update:model-value="changeLanguage"
          />
        </div>
      </div>

      <!-- Armazenamento - compacto -->
      <div class="settings-card">
        <div class="card-header">
          <i class="pi pi-database"></i>
          <span>{{ t('settings.storage') }}</span>
        </div>
        <div class="storage-stats">
          <div class="storage-stat">
            <span class="stat-value">{{ projectCount }}</span>
            <span class="stat-label">{{ t('settings.totalProjects') }}</span>
          </div>
          <div class="storage-stat">
            <span class="stat-value">{{ photoCount }}</span>
            <span class="stat-label">{{ t('settings.totalPhotos') }}</span>
          </div>
          <div class="storage-stat">
            <span class="stat-value">{{ formatBytes(dbSize) }}</span>
            <span class="stat-label">{{ t('settings.dbSize') }}</span>
          </div>
        </div>
        <button class="clear-btn" @click="clearCache">
          <i class="pi pi-trash"></i>
          <span>{{ t('settings.clearCache') }}</span>
        </button>
      </div>

      <!-- Sobre - compacto -->
      <div class="settings-card">
        <div class="card-header">
          <i class="pi pi-info-circle"></i>
          <span>{{ t('settings.about') }}</span>
        </div>
        <div class="about-compact">
          <p class="app-name">PWA Reports <span class="version">v2.0.0</span></p>
          <p class="app-desc">{{ t('settings.description') }}</p>
          <p class="offline-badge">
            <i class="pi pi-wifi"></i>
            {{ t('settings.offline') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Dropdown from 'primevue/dropdown'
import { useI18nStore } from '../../../stores/i18n'
import { db } from '../../../core/database/db'

const i18nStore = useI18nStore()

const projectCount = ref(0)
const photoCount = ref(0)
const dbSize = ref(0)

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
  calculateStorageSize()
})
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overscroll-behavior: none;
}

.settings-content {
  flex: 1;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  overscroll-behavior: none;
}

/* ========= Card genérico ========= */
.settings-card {
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.card-header i {
  font-size: 0.75rem;
}

/* ========= Idioma em linha ========= */
.card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.card-row-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--p-text-color);
}

.card-row-label i {
  font-size: 0.9rem;
  color: var(--p-primary-color);
}

:deep(.lang-dropdown) {
  font-size: 16px !important;
  min-width: 140px;
}

:deep(.lang-dropdown .p-select-label) {
  font-size: 16px !important;
  padding: 0.4rem 0.6rem;
}

/* ========= Storage compacto ========= */
.storage-stats {
  display: flex;
  gap: 0.5rem;
}

.storage-stat {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.4rem;
  background: var(--p-surface-0);
  border-radius: 8px;
}

.stat-value {
  font-size: 1rem;
  font-weight: 700;
  color: var(--p-primary-color);
}

.stat-label {
  font-size: 0.6rem;
  color: var(--p-text-color-secondary);
  text-transform: uppercase;
  font-weight: 500;
  text-align: center;
}

.clear-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.5rem;
  background: none;
  border: 1px solid var(--p-red-200, #fecaca);
  border-radius: 8px;
  color: var(--p-red-600, #dc2626);
  font-size: 0.78rem;
  font-weight: 500;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s;
}

.clear-btn:active {
  background: var(--p-red-50, #fef2f2);
  transform: scale(0.97);
}

.clear-btn i {
  font-size: 0.75rem;
}

/* ========= Sobre compacto ========= */
.about-compact {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.app-name {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.version {
  font-weight: 400;
  color: var(--p-text-color-secondary);
  font-size: 0.8rem;
}

.app-desc {
  margin: 0;
  font-size: 0.78rem;
  color: var(--p-text-color-secondary);
}

.offline-badge {
  margin: 0.25rem 0 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.72rem;
  color: #059669;
  font-weight: 500;
}

.offline-badge i {
  font-size: 0.7rem;
}
</style>
