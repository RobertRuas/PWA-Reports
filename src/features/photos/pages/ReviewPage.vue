<template>
  <div class="review-page">
    <!-- ==================== VIEWER FULL-SCREEN ==================== -->
    <div v-if="viewerOpen && currentPhoto" class="viewer-overlay">
      <!-- Barra de controles no topo -->
      <div class="viewer-top-bar">
        <Button icon="pi pi-times" text rounded class="v-btn" @click="closeViewer" />
        <div class="viewer-controls">
          <Button icon="pi pi-refresh" text rounded class="v-btn" @click="rotatePhoto" />
          <Button icon="pi pi-arrows-h" text rounded class="v-btn" @click="flipPhoto" />
          <Button icon="pi pi-undo" text rounded class="v-btn" :disabled="!lastMove" @click="undoMove" />
          <Button icon="pi pi-trash" text rounded severity="danger" class="v-btn" @click="trashPhoto" />
        </div>
        <span class="viewer-counter">{{ currentIndex + 1 }}/{{ reviewPhotos.length }}</span>
      </div>

      <!-- Área da imagem -->
      <div class="viewer-image-area" @touchstart="onTouchStart" @touchend="onTouchEnd">
        <img
          :src="currentPhotoUrl"
          :alt="currentPhoto.filename"
          :style="imageTransformStyle"
          class="viewer-image"
        />
      </div>

      <!-- Grid de pastas no fundo (6 colunas como na screenshot) -->
      <div class="viewer-bottom">
        <span class="move-label">Move to</span>
        <div class="folder-grid">
          <button
            v-for="folder in viewerFolders"
            :key="folder"
            :class="[
              'folder-btn',
              { active: currentPhoto.folder === folder, trash: folder === 'Trash' }
            ]"
            @click="moveCurrentPhoto(folder)"
          >
            {{ folder }}
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== PÁGINA DE REVISÃO (GRID POR PASTA) ==================== -->
    <PageHeader title="Revisão" subtitle="Organize em pastas" :show-back="true" :back-href="'/project/' + projectId" />

    <div class="content">
      <!-- Botão iniciar revisão -->
      <button v-if="inboxPhotos.length > 0" class="start-review-btn" @click="startReview">
        <i class="pi pi-images"></i>
        <strong>Revisar {{ inboxPhotos.length }} foto(s) do Inbox</strong>
        <i class="pi pi-chevron-right"></i>
      </button>

      <!-- Lista de pastas com fotos (como na screenshot 1) -->
      <div v-for="folder in foldersWithPhotos" :key="folder" class="folder-section">
        <div class="folder-header">
          <strong class="folder-name">{{ folder }}</strong>
          <span class="folder-count">{{ getFolderCount(folder) }}</span>
        </div>
        <div class="folder-photos-grid">
          <div
            v-for="photo in getPhotosInFolder(folder)"
            :key="photo.id"
            class="photo-thumb"
            @click="openPhotoInViewer(photo)"
          >
            <img :src="getPhotoUrl(photo)" :alt="photo.filename" loading="lazy" />
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

    <!-- Navegação inferior -->
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
import type { Photo } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const route = useRoute()
const photoStore = usePhotosStore()
const projectStore = useProjectsStore()

const projectId = ref('')
const viewerOpen = ref(false)
const currentIndex = ref(0)
const currentPhotoUrl = ref('')
const touchStartX = ref(0)
const rotation = ref(0)
const flipped = ref(false)
const lastMove = ref<{ photoId: string; fromFolder: string } | null>(null)

// Mapa de URLs para evitar criar múltiplos objectURLs
const photoUrlCache = new Map<string, string>()

// Fotos do projeto
const projectPhotos = computed(() => photoStore.projectPhotos)
const photosByFolder = computed(() => photoStore.photosByFolder)

// Fotos no Inbox
const inboxPhotos = computed(() => projectPhotos.value.filter(p => p.folder === 'Inbox'))

// Todas as fotos para o viewer
const reviewPhotos = computed(() => projectPhotos.value)

// Foto atual no viewer
const currentPhoto = computed(() => {
  if (reviewPhotos.value.length === 0) return null
  return reviewPhotos.value[currentIndex.value] || null
})

// Pastas do mapa
const mapFolders = ref<string[]>([])

// Pastas para o grid do viewer (sem Inbox, 6 colunas)
const viewerFolders = computed(() => {
  return mapFolders.value.filter(f => f !== 'Inbox')
})

// Pastas que têm fotos (para exibição na página)
const foldersWithPhotos = computed(() => {
  return mapFolders.value.filter(f => getFolderCount(f) > 0)
})

// Estilo de transformação da imagem
const imageTransformStyle = computed(() => {
  const transforms: string[] = []
  if (rotation.value !== 0) transforms.push(`rotate(${rotation.value}deg)`)
  if (flipped.value) transforms.push('scaleX(-1)')
  return { transform: transforms.join(' ') || 'none' }
})

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

const getPhotosInFolder = (folder: string) => {
  return photosByFolder.value[folder] || []
}

const getPhotoUrl = (photo: Photo) => {
  if (photoUrlCache.has(photo.id)) {
    return photoUrlCache.get(photo.id)!
  }
  const url = URL.createObjectURL(photo.data)
  photoUrlCache.set(photo.id, url)
  return url
}

// Abrir foto específica no viewer
const openPhotoInViewer = (photo: Photo) => {
  const idx = reviewPhotos.value.findIndex(p => p.id === photo.id)
  if (idx >= 0) {
    currentIndex.value = idx
    resetImageTransform()
    updatePhotoUrl()
    viewerOpen.value = true
  }
}

const startReview = () => {
  const firstInboxIdx = reviewPhotos.value.findIndex(p => p.folder === 'Inbox')
  currentIndex.value = firstInboxIdx >= 0 ? firstInboxIdx : 0
  resetImageTransform()
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

const resetImageTransform = () => {
  rotation.value = 0
  flipped.value = false
}

// Controles de imagem
const rotatePhoto = () => {
  rotation.value = (rotation.value + 90) % 360
}

const flipPhoto = () => {
  flipped.value = !flipped.value
}

const trashPhoto = () => {
  moveCurrentPhoto('Trash')
}

const undoMove = async () => {
  if (!lastMove.value) return
  await photoStore.movePhoto(lastMove.value.photoId, lastMove.value.fromFolder)
  lastMove.value = null
  updatePhotoUrl()
}

// Navegação
const nextPhoto = () => {
  if (currentIndex.value < reviewPhotos.value.length - 1) {
    currentIndex.value++
    resetImageTransform()
    updatePhotoUrl()
  }
}

const prevPhoto = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    resetImageTransform()
    updatePhotoUrl()
  }
}

const moveCurrentPhoto = async (folder: string) => {
  const photo = currentPhoto.value
  if (!photo) return

  // Guardar para desfazer
  lastMove.value = { photoId: photo.id, fromFolder: photo.folder }

  await photoStore.movePhoto(photo.id, folder)
  resetImageTransform()

  // Avançar para próxima foto
  if (reviewPhotos.value.length === 0) {
    closeViewer()
    return
  }
  if (currentIndex.value >= reviewPhotos.value.length) {
    currentIndex.value = reviewPhotos.value.length - 1
  }
  updatePhotoUrl()
}

// Swipe
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
  gap: 1rem;
}

/* ========= Botão iniciar revisão ========= */
.start-review-btn {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--p-primary-50);
  border: 2px solid var(--p-primary-color);
  border-radius: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  text-align: left;
  color: var(--p-primary-color);
}

.start-review-btn:active {
  transform: scale(0.98);
  background: var(--p-primary-100);
}

.start-review-btn i:first-child {
  font-size: 1.1rem;
}

.start-review-btn strong {
  flex: 1;
  font-size: 0.9rem;
  color: var(--p-text-color);
}

.start-review-btn .pi-chevron-right {
  font-size: 0.8rem;
  opacity: 0.6;
}

/* ========= Seções de pastas com fotos (screenshot 1) ========= */
.folder-section {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.folder-header {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
}

.folder-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.folder-count {
  font-size: 0.9rem;
  color: var(--p-text-muted-color);
  font-weight: 400;
}

.folder-photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
  gap: 3px;
}

.photo-thumb {
  position: relative;
  cursor: pointer;
  aspect-ratio: 1;
  overflow: hidden;
  border-radius: 4px;
  background: var(--p-surface-100);
  -webkit-tap-highlight-color: transparent;
}

.photo-thumb:active {
  opacity: 0.8;
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

/* ==================== VIEWER OVERLAY ==================== */
.viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: #111;
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Barra de topo com controles */
.viewer-top-bar {
  display: flex;
  align-items: center;
  padding: 0.4rem 0.5rem;
  padding-top: calc(0.4rem + env(safe-area-inset-top, 0px));
  background: rgba(0, 0, 0, 0.6);
  flex-shrink: 0;
  gap: 0.25rem;
}

:deep(.v-btn) {
  color: rgba(255, 255, 255, 0.85) !important;
  width: 36px !important;
  height: 36px !important;
}

.viewer-controls {
  display: flex;
  gap: 0.15rem;
  flex: 1;
  justify-content: center;
}

.viewer-counter {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  font-weight: 500;
  min-width: 36px;
  text-align: right;
}

/* Área da imagem */
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
  transition: transform 0.2s ease;
}

/* Fundo do viewer com grid de pastas */
.viewer-bottom {
  background: rgba(30, 30, 30, 0.95);
  padding: 0.6rem 0.6rem;
  padding-bottom: calc(0.6rem + env(safe-area-inset-bottom, 0px));
  flex-shrink: 0;
}

.move-label {
  display: block;
  text-align: center;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.7rem;
  margin-bottom: 0.5rem;
}

.folder-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.folder-btn {
  height: 42px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.12s ease;
}

.folder-btn:active {
  transform: scale(0.92);
  background: rgba(255, 255, 255, 0.2);
}

.folder-btn.active {
  background: var(--p-primary-color);
  color: white;
}

.folder-btn.trash {
  color: #f87171;
}
</style>
