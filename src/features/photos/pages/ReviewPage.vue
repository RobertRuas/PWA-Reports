<template>
  <div class="review-page">
    <PageHeader title="Revisão" subtitle="Organize em pastas" />

    <div class="content">
      <div v-if="selectedPhoto" class="photo-control-panel">
        <div class="control-header">
          <h3>Mover foto para:</h3>
          <Button
            icon="pi pi-times"
            text
            @click="selectedPhoto = null"
          />
        </div>
        <div class="folder-buttons">
          <Button
            v-for="folderName in folderList"
            :key="folderName"
            :label="folderName"
            @click="movePhotoToFolder(selectedPhoto.id, folderName)"
            :severity="selectedPhoto.folder === folderName ? 'success' : 'secondary'"
            :icon="selectedPhoto.folder === folderName ? 'pi pi-check' : ''"
            class="folder-btn"
          />
        </div>
      </div>

      <div class="folders-container">
        <div
          v-for="(folderPhotos, folder) in photosByFolder"
          :key="folder"
          class="folder-section"
          @dragover.prevent="dragOverFolder = folder"
          @dragleave="dragOverFolder = null"
          @drop="handleDrop($event, folder)"
          :class="{ 'drag-over': dragOverFolder === folder }"
        >
          <div class="folder-header">
            <h3>{{ folder }} ({{ folderPhotos.length }})</h3>
          </div>
          <div class="folder-photos">
            <div
              v-for="photo in folderPhotos"
              :key="photo.id"
              class="photo-item"
              draggable
              @dragstart="draggedPhotoId = photo.id"
              @dragend="draggedPhotoId = null"
              @click="selectedPhoto = photo"
              :class="{ dragging: draggedPhotoId === photo.id, selected: selectedPhoto?.id === photo.id }"
            >
              <img :src="getPhotoUrl(photo)" :alt="photo.filename" loading="lazy" />
              <div v-if="selectedPhoto?.id === photo.id" class="selected-badge">
                <i class="pi pi-check"></i>
              </div>
            </div>
            <div v-if="folderPhotos.length === 0" class="empty-folder">
              {{ folder === 'Trash' ? 'Lixeira vazia' : 'Nenhuma foto' }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="nav-buttons">
      <Button
        icon="pi pi-arrow-left"
        label="Triagem"
        severity="secondary"
        @click="goToTriage"
      />
      <Button
        icon="pi pi-arrow-right"
        label="Exportar"
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
import type { Photo } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const route = useRoute()
const photoStore = usePhotosStore()

const projectId = ref<string>('')
const draggedPhotoId = ref<string | null>(null)
const dragOverFolder = ref<string | null>(null)
const selectedPhoto = ref<Photo | null>(null)
const { photosByFolder } = photoStore

const folderList = computed(() => {
  const folders = Object.keys(photosByFolder)
  return [...new Set(folders)].sort()
})

onMounted(async () => {
  projectId.value = route.params.projectId as string
  await photoStore.loadPhotos(projectId.value)
})

const handleDrop = async (_event: DragEvent, targetFolder: string) => {
  dragOverFolder.value = null
  if (draggedPhotoId.value) {
    await photoStore.movePhoto(draggedPhotoId.value, targetFolder)
    draggedPhotoId.value = null
    selectedPhoto.value = null
  }
}

const movePhotoToFolder = async (photoId: string, folderName: string) => {
  await photoStore.movePhoto(photoId, folderName)
  selectedPhoto.value = null
}

const getPhotoUrl = (photo: Photo) => {
  return URL.createObjectURL(photo.data)
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
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.photo-control-panel {
  background: var(--p-primary-50);
  border: 2px solid var(--p-primary-color);
  border-radius: 8px;
  padding: 1rem;
  animation: slideDown 0.3s ease;
  position: sticky;
  top: 0;
  z-index: 10;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.control-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.control-header h3 {
  margin: 0;
  color: var(--p-text-color);
  font-size: 1rem;
}

.folder-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  gap: 0.5rem;
}

:deep(.folder-btn) {
  font-size: 0.85rem;
  height: 40px;
  word-break: break-word;
}

.folders-container {
  display: grid;
  gap: 1rem;
  flex: 1;
}

.folder-section {
  background: var(--p-surface-50);
  border: 2px solid var(--p-surface-200);
  border-radius: 8px;
  padding: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.folder-section.drag-over {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.folder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.folder-header h3 {
  margin: 0;
  color: var(--p-text-color);
  font-size: 0.95rem;
  font-weight: 600;
}

.folder-photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 0.5rem;
  min-height: 80px;
}

.photo-item {
  cursor: grab;
  border-radius: 6px;
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--p-surface-100);
  transition: all 0.3s ease;
  position: relative;
  border: 2px solid transparent;
}

.photo-item:active {
  cursor: grabbing;
}

.photo-item.dragging {
  opacity: 0.4;
  transform: scale(0.95);
}

.photo-item.selected {
  border-color: var(--p-primary-color);
  box-shadow: 0 0 12px rgba(var(--p-primary-500), 0.3);
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-item:hover img {
  transform: scale(1.05);
}

.selected-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--p-primary-color);
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  animation: slideIn 0.3s ease;
}

.empty-folder {
  grid-column: 1 / -1;
  padding: 2rem 1rem;
  text-align: center;
  color: var(--p-text-color-secondary);
  font-size: 0.9rem;
}

.nav-buttons {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
}

.nav-buttons button {
  flex: 1;
  height: 44px;
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .content {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .photo-control-panel {
    padding: 0.75rem;
  }

  .folder-buttons {
    grid-template-columns: repeat(auto-fit, minmax(70px, 1fr));
    gap: 0.4rem;
  }

  .folder-photos {
    grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
    gap: 0.4rem;
  }

  .folder-section {
    padding: 0.75rem;
  }
}
</style>
