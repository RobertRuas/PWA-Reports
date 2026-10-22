<template>
  <div class="review-page">
    <PageHeader title="Revisão" subtitle="Organize em pastas" />

    <div class="content">
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
          <h3>{{ folder }}</h3>
          <div class="folder-photos">
            <div
              v-for="photo in folderPhotos"
              :key="photo.id"
              class="photo-item"
              draggable
              @dragstart="draggedPhotoId = photo.id"
              @dragend="draggedPhotoId = null"
              @click="viewPhoto(photo)"
              :class="{ dragging: draggedPhotoId === photo.id }"
            >
              <img :src="getPhotoUrl(photo)" :alt="photo.filename" />
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
import { ref, onMounted } from 'vue'
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
const { photosByFolder } = photoStore

onMounted(async () => {
  projectId.value = route.params.projectId as string
  await photoStore.loadPhotos(projectId.value)
})

const handleDrop = async (_event: DragEvent, targetFolder: string) => {
  dragOverFolder.value = null
  if (draggedPhotoId.value) {
    await photoStore.movePhoto(draggedPhotoId.value, targetFolder)
    draggedPhotoId.value = null
  }
}

const getPhotoUrl = (photo: Photo) => {
  return URL.createObjectURL(photo.data)
}

const viewPhoto = (photo: Photo) => {
  router.push(`/project/${projectId.value}/viewer/${photo.id}`)
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
}

.folders-container {
  display: grid;
  gap: 1.5rem;
}

.folder-section {
  background: var(--p-surface-50);
  border: 2px solid var(--p-surface-200);
  border-radius: var(--p-border-radius);
  padding: 1rem;
  transition: all 0.2s;
}

.folder-section.drag-over {
  border-color: var(--p-primary-color);
  background: var(--p-primary-50);
}

.folder-section h3 {
  margin: 0 0 1rem;
  color: var(--p-text-color);
}

.folder-photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.5rem;
  min-height: 100px;
}

.photo-item {
  cursor: grab;
  border-radius: var(--p-border-radius);
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--p-surface-100);
  transition: all 0.2s;
}

.photo-item:active {
  cursor: grabbing;
}

.photo-item.dragging {
  opacity: 0.5;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-folder {
  grid-column: 1 / -1;
  padding: 2rem;
  text-align: center;
  color: var(--p-text-color-secondary);
}

.nav-buttons {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--p-surface-200);
}

.nav-buttons button {
  flex: 1;
}
</style>
