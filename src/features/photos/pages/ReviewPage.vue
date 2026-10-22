<template>
  <div class="review-page">
    <!-- Modo visualizador full-screen -->
    <div v-if="viewerOpen && currentPhoto" class="viewer-overlay">
      <div class="viewer-top-bar">
        <Button icon="pi pi-times" text rounded class="viewer-close-btn" @click="closeViewer" />
        <span class="viewer-counter">{{ currentIndex + 1 }} / {{ reviewPhotos.length }}</span>
        <span class="viewer-folder-badge">{{ currentPhoto.folder }}</span>
      </div>

      <div class="viewer-image-area" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <img :src="currentPhotoUrl" :alt="currentPhoto.filename" class="viewer-image" />
      </div>

      <!-- Botões numéricos para mover foto -->
      <div class="viewer-bottom">
        <div class="folder-numbers-scroll">
          <div class="folder-numbers">
            <button
              v-for="folder in mapFolders"
              :key="folder"
              class="folder-num-btn"
              :class="{
                active: currentPhoto.folder === folder,
                special: folder === 'General' || folder === 'Trash'
              }"
              @click="moveCurrentPhoto(folder)"
            >
              <template v-if="folder === 'Inbox'">
                <i class="pi pi-inbox"></i>
              </template>
              <template v-else-if="folder === 'General'">
                <i class="pi pi-star"></i>
              </template>
              <template v-else-if="folder === 'Trash'">
                <i class="pi pi-trash"></i>
              </template>
              <template v-else>
                {{ folder }}
              </template>
            </button>
          </div>
        </div>

        <div class="viewer-nav-arrows">
          <Button
            icon="pi pi-chevron-left"
            text
            rounded
            :disabled="currentIndex === 0"
            class="nav-arrow"
            @click="prevPhoto"
          />
          <span class="nav-hint">Deslize ou use as setas</span>
          <Button
            icon="pi pi-chevron-right"
            text
            rounded
            :disabled="currentIndex >= reviewPhotos.length - 1"
            class="nav-arrow"
            @click="nextPhoto"
          />
        </div>
      </div>
    </div>

    <!-- Página de revisão normal -->
    <PageHeader title="Revisão" subtitle="Organize em pastas" />

    <div class="content">
      <!-- Botão principal de revisão -->
      <button v-if="inboxPhotos.length > 0" class="start-review-btn" @click="startReview">
        <div class="review-btn-icon">
          <i class="pi pi-images"></i>
        </div>
        <div class="review-btn-text">
          <strong>Revisar {{ inboxPhotos.length }} foto(s)</strong>
          <span>Toque para classificar uma a uma</span>
        </div>
        <i class="pi pi-chevron-right"></i>
      </button>

      <!-- Resumo por pasta -->
      <div class="folder-summary">
        <h4>Organização</h4>
        <div class="summary-grid">
          <div
            v-for="folder in mapFolders"
            :key="folder"
            class="summary-item"
            :class="{ 'has-photos': getFolderCount(folder) > 0 }"
          >
            <span class="summary-label">{{ folder }}</span>
            <span class="summary-count">{{ getFolderCount(folder) }}</span>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="projectPhotos.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>Nenhuma foto para revisar</p>
        <span>Vá para Triagem e carregue fotos primeiro</span>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="nav-buttons">
      <Button
        icon="pi pi-arrow-left"
        label="Triagem"
        severity="secondary"
        size="small"
        @click="goToTriage"
      />
      <Button
        icon="pi pi-arrow-right"
        label="Exportar"
        size="small"
        @click="goToExport"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '../../../components/ui/PageHeader.vue'
import Button from 'primevue/button'
import { usePhotosStore } from '../../../stores/photos'
import { useProjectsStore } from '../../../stores/projects'
import { MAPS } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const route = useRoute()
const photoStore = usePhotosStore()
const projectStore = useProjectsStore()

const projectId = ref<string>('')
const viewerOpen = ref(false)
const currentIndex = ref(0)
const currentPhotoUrl = ref('')
const touchStartX = ref(0)

// Fotos do projeto (reativo via computed)
const projectPhotos = computed(() => photoStore.projectPhotos)
const photosByFolder = computed(() => photoStore.photosByFolder)

// Fotos no Inbox para revisão
const inboxPhotos = computed(() => {
  return projectPhotos.value.filter(p => p.folder === 'Inbox')
})

// Fotos para o viewer (todas)
const reviewPhotos = computed(() => projectPhotos.value)

// Foto atual no viewer
const currentPhoto = computed(() => {
  if (reviewPhotos.value.length === 0) return null
  return reviewPhotos.value[currentIndex.value] || null
})

// Pastas do mapa atual
const mapFolders = ref<string[]>([])

onMounted(async () => {
  projectId.value = route.params.projectId as string
  await photoStore.loadPhotos(projectId.value)

  // Carregar pastas do mapa do projeto
  const project = await projectStore.getProject(projectId.value)
  if (project) {
    const mapInfo = MAPS[project.mapId as keyof typeof MAPS]
    if (mapInfo) {
      mapFolders.value = [...mapInfo.folders]
    }
  }
})

const getFolderCount = (folder: string) => {
  return photosByFolder.value[folder]?.length || 0
}

const startReview = () => {
  // Começar pelo primeiro item do Inbox
  const firstInboxIndex = reviewPhotos.value.findIndex(p => p.folder === 'Inbox')
  currentIndex.value = firstInboxIndex >= 0 ? firstInboxIndex : 0
  updatePhotoUrl()
  viewerOpen.value = true
}

const closeViewer = () => {
  viewerOpen.value = false
  if (currentPhotoUrl.value) {
    URL.revokeObjectURL(currentPhotoUrl.value)
    currentPhotoUrl.value = ''
  }
}

const updatePhotoUrl = () => {
  if (currentPhotoUrl.value) {
    URL.revokeObjectURL(currentPhotoUrl.value)
  }
  const photo = currentPhoto.value
  if (photo) {
    currentPhotoUrl.value = URL.createObjectURL(photo.data)
  }
}

const nextPhoto = () => {
  if (currentIndex.value < reviewPhotos.value.length - 1) {
    currentIndex.value++
    updatePhotoUrl()
  }
}

const prevPhoto = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    updatePhotoUrl()
  }
}

const moveCurrentPhoto = async (folder: string) => {
  const photo = currentPhoto.value
  if (!photo) return

  await photoStore.movePhoto(photo.id, folder)

  // Avançar para próxima foto automaticamente
  if (currentIndex.value < reviewPhotos.value.length - 1) {
    currentIndex.value++
  } else if (reviewPhotos.value.length > 0 && currentIndex.value >= reviewPhotos.value.length) {
    currentIndex.value = reviewPhotos.value.length - 1
  }
  updatePhotoUrl()

  // Fechar se não há mais fotos
  if (reviewPhotos.value.length === 0) {
    closeViewer()
  }
}

// Swipe touch
const onTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0].clientX
}

const onTouchEnd = (e: TouchEvent) => {
  const diff = touchStartX.value - e.changedTouches[0].clientX
  if (Math.abs(diff) > 60) {
    if (diff > 0) nextPhoto()
    else prevPhoto()
  }
}

const goToTriage = () => {
  router.push(`/project/${projectId.value}/triage`)
}

const goToExport = () => {
  router.push(`/project/${projectId.value}/export`)
}
</script>

<style scoped>
.review-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ========= Botão de início de revisão ========= */
.start-review-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem;
  background: var(--p-primary-50);
  border: 2px solid var(--p-primary-color);
  border-radius: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease;
  text-align: left;
}

.start-review-btn:active {
  transform: scale(0.98);
  background: var(--p-primary-100);
}

.review-btn-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: var(--p-primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.review-btn-icon i {
  font-size: 1.1rem;
}

.review-btn-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.review-btn-text strong {
  font-size: 0.9rem;
  color: var(--p-text-color);
}

.review-btn-text span {
  font-size: 0.75rem;
  color: var(--p-text-color-secondary);
}

.start-review-btn > .pi-chevron-right {
  color: var(--p-primary-color);
  font-size: 0.85rem;
}

/* ========= Resumo por pastas ========= */
.folder-summary h4 {
  margin: 0.5rem 0 0.5rem;
  font-size: 0.85rem;
  color: var(--p-text-color-secondary);
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
  gap: 0.4rem;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.5rem 0.25rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.summary-item.has-photos {
  border-color: var(--p-primary-200);
  background: var(--p-primary-50);
}

.summary-label {
  font-size: 0.7rem;
  color: var(--p-text-color-secondary);
  font-weight: 500;
}

.summary-count {
  font-size: 1rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.summary-item.has-photos .summary-count {
  color: var(--p-primary-color);
}

/* ========= Empty state ========= */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 2rem 1rem;
  text-align: center;
}

.empty-state i {
  font-size: 2.5rem;
  color: var(--p-text-color-secondary);
  opacity: 0.5;
  margin-bottom: 0.75rem;
}

.empty-state p {
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
  color: var(--p-text-color);
}

.empty-state span {
  font-size: 0.8rem;
  color: var(--p-text-color-secondary);
}

/* ========= Viewer overlay (full-screen) ========= */
.viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: #000;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.viewer-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  padding-top: calc(0.5rem + env(safe-area-inset-top, 0px));
  background: rgba(0, 0, 0, 0.8);
  flex-shrink: 0;
}

:deep(.viewer-close-btn) {
  color: white !important;
}

.viewer-counter {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
}

.viewer-folder-badge {
  background: var(--p-primary-color);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 600;
}

.viewer-image-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: pan-y;
}

.viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.viewer-bottom {
  background: rgba(0, 0, 0, 0.9);
  padding: 0.5rem 0.5rem;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
}

.folder-numbers-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  margin-bottom: 0.5rem;
  scrollbar-width: none;
}

.folder-numbers-scroll::-webkit-scrollbar {
  display: none;
}

.folder-numbers {
  display: flex;
  gap: 0.35rem;
  min-width: max-content;
  padding: 0.25rem 0;
}

.folder-num-btn {
  min-width: 40px;
  height: 36px;
  padding: 0 0.5rem;
  border-radius: 8px;
  border: 1.5px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s ease;
}

.folder-num-btn:active {
  transform: scale(0.92);
}

.folder-num-btn.active {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: white;
}

.folder-num-btn.special {
  font-size: 0.9rem;
}

.folder-num-btn i {
  font-size: 0.85rem;
}

.viewer-nav-arrows {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

:deep(.nav-arrow) {
  color: rgba(255, 255, 255, 0.7) !important;
  width: 36px !important;
  height: 36px !important;
}

.nav-hint {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.35);
}

/* ========= Nav buttons ========= */
.nav-buttons {
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem;
  border-top: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
}

.nav-buttons button {
  flex: 1;
  height: 40px;
  font-size: 0.85rem;
}
</style>
