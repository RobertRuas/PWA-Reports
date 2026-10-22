<template>
  <div class="review-page">
    <!-- ==================== VIEWER FULL-SCREEN ==================== -->
    <div v-if="viewerOpen && currentPhoto" class="viewer-overlay" @touchstart="onViewerTouchStart" @touchmove="onViewerTouchMove" @touchend="onViewerTouchEnd">
      <!-- Imagem em tela cheia -->
      <div class="viewer-image-area">
        <img
          ref="viewerImg"
          :src="currentPhotoUrl"
          :alt="currentPhoto.filename"
          :style="imageTransformStyle"
          class="viewer-image"
        />
      </div>

      <!-- Barra de controles translúcida sobreposta à imagem -->
      <div class="viewer-control-bar">
        <div class="control-bar-left">
          <button class="ctrl-btn" @click="closeViewer">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="control-bar-center">
          <button class="ctrl-btn" @click="rotatePhoto"><i class="pi pi-refresh"></i></button>
          <button class="ctrl-btn" @click="flipPhoto"><i class="pi pi-arrows-h"></i></button>
          <button class="ctrl-btn" :disabled="!lastMove" @click="undoMove"><i class="pi pi-undo"></i></button>
          <button class="ctrl-btn danger" @click="trashPhoto"><i class="pi pi-trash"></i></button>
        </div>
        <div class="control-bar-right">
          <span class="viewer-counter">{{ currentIndex + 1 }}/{{ reviewPhotos.length }}</span>
        </div>
      </div>

      <!-- Grid de pastas para mover (tema claro) -->
      <div class="viewer-bottom">
        <div class="folder-grid">
          <button
            v-for="folder in viewerFolders"
            :key="folder"
            :class="[
              'folder-btn',
              getFolderClass(folder),
              { active: currentPhoto.folder === folder }
            ]"
            @click="moveCurrentPhoto(folder)"
          >
            {{ folder }}
          </button>
        </div>
      </div>
    </div>

    <!-- ==================== PÁGINA DE REVISÃO ==================== -->
    <div class="review-header">
      <h2 class="review-title">Revisão</h2>
      <div class="review-toolbar">
        <button class="tool-btn" :class="{ active: zoomMode === 'auto' }" @click="setZoomMode('auto')" title="Auto">
          <i class="pi pi-arrows-alt"></i>
        </button>
        <button class="tool-btn" @click="zoomIn" title="Zoom +">
          <i class="pi pi-search-plus"></i>
        </button>
        <button class="tool-btn" @click="zoomOut" title="Zoom -">
          <i class="pi pi-search-minus"></i>
        </button>
        <span class="toolbar-divider"></span>
        <button class="tool-btn" :class="{ active: selectionMode }" @click="toggleSelectionMode" title="Selecionar">
          <i class="pi pi-check-square"></i>
        </button>
        <template v-if="selectionMode && selectedPhotos.size > 0">
          <button class="tool-btn danger" @click="deleteSelectedPhotos" title="Eliminar selecionados">
            <i class="pi pi-trash"></i>
          </button>
          <button class="tool-btn" @click="uncategorizeSelectedPhotos" title="Descategorizar">
            <i class="pi pi-inbox"></i>
          </button>
          <span class="selection-count">{{ selectedPhotos.size }}</span>
        </template>
      </div>
    </div>

    <div class="content" :class="{ 'auto-mode': zoomMode === 'auto' }">
      <!-- Botão iniciar revisão do Inbox -->
      <button v-if="inboxPhotos.length > 0" class="start-review-btn" @click="startReview">
        <i class="pi pi-images"></i>
        <strong>Revisar {{ inboxPhotos.length }} foto(s) por categorizar</strong>
        <i class="pi pi-chevron-right"></i>
      </button>

      <!-- Lista de pastas com fotos -->
      <div v-for="folder in foldersWithPhotos" :key="folder" class="folder-section">
        <div class="folder-header">
          <strong class="folder-name">{{ folder }}</strong>
          <span class="folder-count">{{ getFolderCount(folder) }}</span>
        </div>
        <div class="folder-photos-grid" :style="gridStyle">
          <div
            v-for="photo in getPhotosInFolder(folder)"
            :key="photo.id"
            :class="['photo-thumb', { selected: selectedPhotos.has(photo.id) }]"
            @click="handlePhotoClick(photo)"
          >
            <img :src="getPhotoUrl(photo)" :alt="photo.filename" loading="lazy" />
            <div v-if="selectionMode" class="select-overlay">
              <i :class="selectedPhotos.has(photo.id) ? 'pi pi-check-circle' : 'pi pi-circle'" />
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="projectPhotos.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>Nenhuma foto para revisar</p>
        <span>Importe fotos primeiro</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePhotosStore } from '../../../stores/photos'
import { useProjectsStore } from '../../../stores/projects'
import { MAPS } from '../../../core/database/schemas/project.schema'
import type { Photo } from '../../../core/database/schemas/project.schema'

const route = useRoute()
const photoStore = usePhotosStore()
const projectStore = useProjectsStore()

const projectId = ref('')
const projectName = ref('')
const viewerOpen = ref(false)
const currentIndex = ref(0)
const currentPhotoUrl = ref('')
const rotation = ref(0)
const flipped = ref(false)
const lastMove = ref<{ photoId: string; fromFolder: string } | null>(null)

// Toolbar
const zoomMode = ref<'auto' | 'manual'>('manual')
const thumbSize = ref(90)
const selectionMode = ref(false)
const selectedPhotos = ref<Set<string>>(new Set())

// Swipe down para fechar viewer
const touchStartY = ref(0)
const touchCurrentY = ref(0)
const isSwiping = ref(false)

// Cache de URLs
const photoUrlCache = new Map<string, string>()

// Fotos do projeto
const projectPhotos = computed(() => photoStore.projectPhotos)
const photosByFolder = computed(() => photoStore.photosByFolder)
const inboxPhotos = computed(() => projectPhotos.value.filter(p => p.folder === 'Inbox'))
const reviewPhotos = computed(() => projectPhotos.value)

const currentPhoto = computed(() => {
  if (reviewPhotos.value.length === 0) return null
  return reviewPhotos.value[currentIndex.value] || null
})

// Pastas do mapa
const mapFolders = ref<string[]>([])

const viewerFolders = computed(() => {
  return mapFolders.value.filter(f => f !== 'Inbox')
})

const foldersWithPhotos = computed(() => {
  return mapFolders.value.filter(f => getFolderCount(f) > 0)
})

// Estilo da imagem com transformações
const imageTransformStyle = computed(() => {
  const transforms: string[] = []
  if (rotation.value !== 0) transforms.push(`rotate(${rotation.value}deg)`)
  if (flipped.value) transforms.push('scaleX(-1)')

  // Arrastar para baixo para fechar
  if (isSwiping.value) {
    const deltaY = touchCurrentY.value - touchStartY.value
    if (deltaY > 0) {
      transforms.push(`translateY(${deltaY}px)`)
    }
  }

  return { transform: transforms.join(' ') || 'none' }
})

// Grid style baseado no zoom
const gridStyle = computed(() => {
  if (zoomMode.value === 'auto') {
    // Modo auto: uma só linha por pasta
    return { gridTemplateColumns: `repeat(auto-fill, minmax(${thumbSize.value}px, 1fr))`, flexWrap: 'nowrap' as const }
  }
  return { gridTemplateColumns: `repeat(auto-fill, minmax(${thumbSize.value}px, 1fr))` }
})

// Calcular tamanho máximo para modo auto
const maxFolderPhotoCount = computed(() => {
  let max = 0
  for (const folder of mapFolders.value) {
    const count = getFolderCount(folder)
    if (count > max) max = count
  }
  return max
})

onMounted(async () => {
  projectId.value = route.params.projectId as string
  await photoStore.loadPhotos(projectId.value)

  const project = await projectStore.getProject(projectId.value)
  if (project) {
    projectName.value = project.name
    const mapInfo = MAPS[project.mapId as keyof typeof MAPS]
    if (mapInfo) {
      mapFolders.value = [...mapInfo.folders]
    }
  }
})

onUnmounted(() => {
  // Limpar cache de URLs
  photoUrlCache.forEach(url => URL.revokeObjectURL(url))
  photoUrlCache.clear()
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

// Determinar classe CSS do botão de pasta
const getFolderClass = (folder: string) => {
  if (folder === 'General') return 'general'
  if (folder === 'Trash') return 'trash'
  return ''
}

// Click em foto: selecionar ou abrir viewer
const handlePhotoClick = (photo: Photo) => {
  if (selectionMode.value) {
    if (selectedPhotos.value.has(photo.id)) {
      selectedPhotos.value.delete(photo.id)
    } else {
      selectedPhotos.value.add(photo.id)
    }
    // Forçar reatividade
    selectedPhotos.value = new Set(selectedPhotos.value)
  } else {
    openPhotoInViewer(photo)
  }
}

// Abrir foto no viewer
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
const rotatePhoto = () => { rotation.value = (rotation.value + 90) % 360 }
const flipPhoto = () => { flipped.value = !flipped.value }
const trashPhoto = () => { moveCurrentPhoto('Trash') }

const undoMove = async () => {
  if (!lastMove.value) return
  await photoStore.movePhoto(lastMove.value.photoId, lastMove.value.fromFolder, projectName.value)
  lastMove.value = null
  updatePhotoUrl()
}

const moveCurrentPhoto = async (folder: string) => {
  const photo = currentPhoto.value
  if (!photo) return

  lastMove.value = { photoId: photo.id, fromFolder: photo.folder }
  await photoStore.movePhoto(photo.id, folder, projectName.value)
  resetImageTransform()

  // Invalidar cache da foto movida
  if (photoUrlCache.has(photo.id)) {
    URL.revokeObjectURL(photoUrlCache.get(photo.id)!)
    photoUrlCache.delete(photo.id)
  }

  if (reviewPhotos.value.length === 0) {
    closeViewer()
    return
  }
  if (currentIndex.value >= reviewPhotos.value.length) {
    currentIndex.value = reviewPhotos.value.length - 1
  }
  // Recarregar imagem no novo local
  updatePhotoUrl()
}

// Swipe down para fechar viewer
const onViewerTouchStart = (e: TouchEvent) => {
  touchStartY.value = e.touches[0].clientY
  touchCurrentY.value = e.touches[0].clientY
  isSwiping.value = false
}

const onViewerTouchMove = (e: TouchEvent) => {
  touchCurrentY.value = e.touches[0].clientY
  const deltaY = touchCurrentY.value - touchStartY.value
  if (deltaY > 20) {
    isSwiping.value = true
  }
}

const onViewerTouchEnd = () => {
  const deltaY = touchCurrentY.value - touchStartY.value
  if (isSwiping.value && deltaY > 120) {
    closeViewer()
  }
  isSwiping.value = false
}

// Toolbar - zoom
const zoomIn = () => {
  zoomMode.value = 'manual'
  thumbSize.value = Math.min(thumbSize.value + 20, 200)
}

const zoomOut = () => {
  zoomMode.value = 'manual'
  thumbSize.value = Math.max(thumbSize.value - 20, 50)
}

const setZoomMode = (mode: 'auto' | 'manual') => {
  zoomMode.value = mode
  if (mode === 'auto') {
    // Calcular tamanho baseado na pasta com mais fotos
    const screenWidth = window.innerWidth - 32 // padding
    if (maxFolderPhotoCount.value > 0) {
      thumbSize.value = Math.max(40, Math.floor(screenWidth / maxFolderPhotoCount.value) - 4)
    }
  }
}

// Seleção
const toggleSelectionMode = () => {
  selectionMode.value = !selectionMode.value
  if (!selectionMode.value) {
    selectedPhotos.value = new Set()
  }
}

const deleteSelectedPhotos = async () => {
  if (selectedPhotos.value.size === 0) return
  await photoStore.deletePhotos(Array.from(selectedPhotos.value))
  selectedPhotos.value = new Set()
}

const uncategorizeSelectedPhotos = async () => {
  if (selectedPhotos.value.size === 0) return
  await photoStore.uncategorizePhotos(Array.from(selectedPhotos.value))
  selectedPhotos.value = new Set()
}
</script>

<style scoped>
.review-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overscroll-behavior: none;
}

/* ========= Header + Toolbar ========= */
.review-header {
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-bottom: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
  position: sticky;
  top: 0;
  z-index: 10;
}

.review-title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--p-text-color);
}

.review-toolbar {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tool-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
  color: var(--p-text-color-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s;
}

.tool-btn:active {
  background: var(--p-surface-100);
}

.tool-btn.active {
  background: var(--p-primary-50);
  border-color: var(--p-primary-color);
  color: var(--p-primary-color);
}

.tool-btn.danger {
  color: #ef4444;
}

.tool-btn i {
  font-size: 0.85rem;
}

.toolbar-divider {
  width: 1px;
  height: 20px;
  background: var(--p-surface-200);
  margin: 0 0.15rem;
}

.selection-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--p-primary-color);
  background: var(--p-primary-50);
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
}

/* ========= Conteúdo ========= */
.content {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overscroll-behavior: none;
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

/* ========= Seções de pastas ========= */
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
  font-size: 1rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.folder-count {
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
  font-weight: 400;
}

.folder-photos-grid {
  display: grid;
  gap: 3px;
}

/* Modo auto: sem quebra de linha */
.auto-mode .folder-photos-grid {
  display: flex;
  overflow-x: auto;
  gap: 3px;
  -webkit-overflow-scrolling: touch;
}

.auto-mode .photo-thumb {
  flex-shrink: 0;
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

.photo-thumb.selected {
  outline: 3px solid var(--p-primary-color);
  outline-offset: -3px;
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.select-overlay {
  position: absolute;
  top: 4px;
  right: 4px;
  color: var(--p-primary-color);
  font-size: 1.1rem;
  text-shadow: 0 1px 3px rgba(0,0,0,0.3);
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

/* ==================== VIEWER OVERLAY (TEMA CLARO) ==================== */
.viewer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  background: var(--p-surface-0);
  display: flex;
  flex-direction: column;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Imagem em tela cheia */
.viewer-image-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  touch-action: pan-y;
  background: var(--p-surface-50);
}

.viewer-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.15s ease;
}

/* Barra de controles translúcida sobre a imagem */
.viewer-control-bar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 0.5rem 0.6rem;
  padding-top: calc(0.5rem + env(safe-area-inset-top, 0px));
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.control-bar-left,
.control-bar-right {
  flex-shrink: 0;
}

.control-bar-center {
  display: flex;
  gap: 0.3rem;
  flex: 1;
  justify-content: center;
}

.ctrl-btn {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  border: none;
  background: rgba(0, 0, 0, 0.06);
  color: var(--p-text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.12s;
}

.ctrl-btn:active {
  background: rgba(0, 0, 0, 0.12);
  transform: scale(0.92);
}

.ctrl-btn:disabled {
  opacity: 0.3;
}

.ctrl-btn.danger {
  color: #ef4444;
}

.ctrl-btn i {
  font-size: 1rem;
}

.viewer-counter {
  color: var(--p-text-color-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 38px;
  text-align: right;
}

/* Grid de pastas (tema claro, sem espaços vazios) */
.viewer-bottom {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 0.6rem;
  padding-bottom: calc(0.6rem + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  flex-shrink: 0;
}

.folder-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.folder-btn {
  height: 38px;
  min-width: 0;
  flex: 1 1 calc(16.666% - 5px);
  border-radius: 8px;
  border: 1px solid var(--p-surface-200);
  background: var(--p-surface-50);
  color: var(--p-text-color);
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.12s ease;
  padding: 0 0.3rem;
}

.folder-btn:active {
  transform: scale(0.92);
  background: var(--p-surface-200);
}

.folder-btn.active {
  background: var(--p-primary-color);
  color: white;
  border-color: var(--p-primary-color);
}

/* General e Trash com tamanhos diferentes para melhor harmonia */
.folder-btn.general {
  flex: 1 1 calc(33.333% - 5px);
}

.folder-btn.trash {
  flex: 1 1 calc(33.333% - 5px);
  color: #ef4444;
  border-color: #fecaca;
}

.folder-btn.trash.active {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}
</style>
