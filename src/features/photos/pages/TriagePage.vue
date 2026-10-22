<template>
  <div class="triage-page">
    <div class="content">
      <!-- Upload Area -->
      <div
        class="upload-area"
        :class="{ 'drag-active': isDragging }"
        @click="fileInput?.click()"
        @dragover.prevent="isDragging = true"
        @dragleave="isDragging = false"
        @drop.prevent="handleDrop"
      >
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          hidden
          @change="handleFileSelect"
        />
        <i class="pi pi-cloud-upload upload-icon"></i>
        <p>Toque para selecionar fotos</p>
        <span class="upload-hint">ou arraste aqui</span>
      </div>

      <!-- Upload progress overlay -->
      <div v-if="isUploading" class="upload-progress">
        <div class="progress-card">
          <div class="progress-spinner">
            <i class="pi pi-spin pi-spinner"></i>
          </div>
          <p class="progress-text">Carregando fotos...</p>
          <div class="progress-bar-track">
            <div class="progress-bar-fill" :style="{ width: uploadProgress + '%' }"></div>
          </div>
          <span class="progress-count">{{ uploadedCount }} de {{ totalUploadCount }}</span>
        </div>
      </div>

      <!-- Photos Grid -->
      <div v-if="allPhotos.length > 0" class="photos-container">
        <div class="grid-header">
          <span class="photo-count">{{ allPhotos.length }} foto(s)</span>
        </div>
        <div class="photos-grid">
          <div
            v-for="photo in allPhotos"
            :key="photo.id"
            class="photo-thumb"
            @click="viewPhoto(photo)"
          >
            <img :src="getPhotoUrl(photo)" :alt="photo.filename" loading="lazy" />
            <span class="thumb-folder">{{ photo.folder }}</span>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else-if="!isUploading" class="empty-state">
        <i class="pi pi-camera"></i>
        <p>Nenhuma foto ainda</p>
        <span>Toque acima para carregar</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { usePhotosStore } from '../../../stores/photos'
import { useProjectsStore } from '../../../stores/projects'
import type { Photo } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const route = useRoute()
const photoStore = usePhotosStore()
const projectStore = useProjectsStore()

const fileInput = ref<HTMLInputElement>()
const projectId = ref<string>('')
const projectName = ref<string>('')
const isDragging = ref(false)
const isUploading = ref(false)
const uploadProgress = ref(0)
const uploadedCount = ref(0)
const totalUploadCount = ref(0)

const allPhotos = computed(() => photoStore.projectPhotos)

onMounted(async () => {
  projectId.value = route.params.projectId as string
  await photoStore.loadPhotos(projectId.value)
  // Obter nome do projeto para gerar nomes de ficheiro
  const project = await projectStore.getProject(projectId.value)
  if (project) {
    projectName.value = project.name
  }
})

const handleFileSelect = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files || files.length === 0) return
  await uploadFiles(Array.from(files))
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (!files) return
  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
  if (imageFiles.length > 0) {
    await uploadFiles(imageFiles)
  }
}

const uploadFiles = async (files: File[]) => {
  isUploading.value = true
  uploadedCount.value = 0
  totalUploadCount.value = files.length
  uploadProgress.value = 0

  for (const file of files) {
    await photoStore.addPhoto(projectId.value, 'Inbox', file, projectName.value)
    uploadedCount.value++
    uploadProgress.value = Math.round((uploadedCount.value / totalUploadCount.value) * 100)
  }

  // Pequeno delay para o usuário ver 100%
  await new Promise(resolve => setTimeout(resolve, 400))
  isUploading.value = false
}

const getPhotoUrl = (photo: Photo) => {
  return URL.createObjectURL(photo.data)
}

const viewPhoto = (photo: Photo) => {
  router.push(`/project/${projectId.value}/viewer/${photo.id}`)
}
</script>

<style scoped>
.triage-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overscroll-behavior: none;
}

.content {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  overscroll-behavior: none;
}

/* ========= Upload area ========= */
.upload-area {
  border: 2px dashed var(--p-primary-300);
  border-radius: 12px;
  padding: 1.5rem 1rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--p-surface-50);
  -webkit-tap-highlight-color: transparent;
}

.upload-area:active,
.upload-area.drag-active {
  background: var(--p-primary-50);
  border-color: var(--p-primary-color);
  transform: scale(0.98);
}

.upload-icon {
  font-size: 2rem;
  color: var(--p-primary-color);
  display: block;
  margin-bottom: 0.5rem;
}

.upload-area p {
  margin: 0;
  color: var(--p-text-color);
  font-size: 0.9rem;
  font-weight: 500;
}

.upload-hint {
  font-size: 0.75rem;
  color: var(--p-text-color-secondary);
}

/* ========= Upload progress ========= */
.upload-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
  backdrop-filter: blur(4px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.progress-card {
  background: var(--p-surface-0);
  border-radius: 16px;
  padding: 1.75rem 1.5rem;
  width: 260px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: scaleIn 0.25s ease;
}

@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.9); }
  to { opacity: 1; transform: scale(1); }
}

.progress-spinner i {
  font-size: 2rem;
  color: var(--p-primary-color);
}

.progress-text {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.progress-bar-track {
  width: 100%;
  height: 6px;
  background: var(--p-surface-200);
  border-radius: 3px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  background: var(--p-primary-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-count {
  font-size: 0.75rem;
  color: var(--p-text-color-secondary);
}

/* ========= Photos grid ========= */
.photos-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.grid-header {
  display: flex;
  align-items: center;
}

.photo-count {
  font-size: 0.8rem;
  color: var(--p-text-color-secondary);
  font-weight: 500;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.4rem;
  flex: 1;
}

.photo-thumb {
  position: relative;
  cursor: pointer;
  border-radius: 6px;
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--p-surface-100);
  -webkit-tap-highlight-color: transparent;
}

.photo-thumb:active {
  transform: scale(0.95);
}

.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-folder {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.2rem;
  background: rgba(0, 0, 0, 0.65);
  color: white;
  font-size: 0.6rem;
  font-weight: 500;
  text-align: center;
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
  opacity: 0.4;
  margin-bottom: 0.75rem;
}

.empty-state p {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  color: var(--p-text-color);
}

.empty-state span {
  font-size: 0.8rem;
  color: var(--p-text-color-secondary);
}
</style>
