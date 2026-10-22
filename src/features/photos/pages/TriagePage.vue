<template>
  <div class="triage-page">
    <PageHeader title="Triagem" subtitle="Organize fotos" />

    <div class="content">
      <!-- Upload Area -->
      <div class="upload-area" @dragover.prevent @drop="handleDrop">
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          hidden
          @change="handleFileSelect"
        />
        <i class="pi pi-cloud-upload"></i>
        <p>Arraste fotos aqui ou clique para selecionar</p>
        <Button label="Selecionar Fotos" @click="fileInput?.click()" />
      </div>

      <!-- Photos Grid -->
      <div v-if="projectPhotos.length > 0" class="photos-grid">
        <div
          v-for="photo in projectPhotos"
          :key="photo.id"
          class="photo-card"
          @click="viewPhoto(photo)"
        >
          <img :src="getPhotoUrl(photo)" :alt="photo.filename" />
          <p class="folder-label">{{ photo.folder }}</p>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="pi pi-inbox"></i>
        <p>Nenhuma foto ainda</p>
      </div>
    </div>

    <!-- Navigation Buttons -->
    <div class="nav-buttons">
      <Button
        icon="pi pi-arrow-left"
        label="Voltar"
        severity="secondary"
        @click="goBack"
      />
      <Button
        icon="pi pi-arrow-right"
        label="Revisar"
        @click="goToReview"
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

const fileInput = ref<HTMLInputElement>()
const projectId = ref<string>('')
const { projectPhotos } = photoStore

onMounted(async () => {
  projectId.value = route.params.projectId as string
  await photoStore.loadPhotos(projectId.value)
})

const handleFileSelect = async (event: Event) => {
  const files = (event.target as HTMLInputElement).files
  if (!files) return

  for (const file of files) {
    await photoStore.addPhoto(projectId.value, 'Inbox', file)
  }
}

const handleDrop = async (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (!files) return

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      await photoStore.addPhoto(projectId.value, 'Inbox', file)
    }
  }
}

const getPhotoUrl = (photo: Photo) => {
  return URL.createObjectURL(photo.data)
}

const viewPhoto = (photo: Photo) => {
  router.push(`/project/${projectId.value}/viewer/${photo.id}`)
}

const goBack = () => {
  router.push(`/project/${projectId.value}`)
}

const goToReview = () => {
  router.push(`/project/${projectId.value}/review`)
}
</script>

<style scoped>
.triage-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.upload-area {
  border: 2px dashed var(--p-primary-color);
  border-radius: var(--p-border-radius);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  margin-bottom: 2rem;
  transition: all 0.2s;
}

.upload-area:hover {
  background: var(--p-primary-50);
}

.upload-area i {
  font-size: 3rem;
  color: var(--p-primary-color);
  display: block;
  margin-bottom: 0.5rem;
}

.upload-area p {
  margin: 0.5rem 0;
  color: var(--p-text-color);
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.photo-card {
  position: relative;
  cursor: pointer;
  border-radius: var(--p-border-radius);
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--p-surface-100);
}

.photo-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s;
}

.photo-card:hover img {
  transform: scale(1.05);
}

.folder-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  font-size: 0.8rem;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--p-text-color-secondary);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
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
