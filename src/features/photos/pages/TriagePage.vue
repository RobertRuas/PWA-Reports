<template>
  <div class="triage-page">
    <PageHeader title="Triagem" subtitle="Organize fotos" />

    <div class="content">
      <!-- Upload Area -->
      <div class="upload-area" @dragover.prevent @drop="handleDrop" :class="{ 'drag-active': isDragging }">
        <input
          ref="fileInput"
          type="file"
          multiple
          accept="image/*"
          hidden
          @change="handleFileSelect"
          @dragenter="isDragging = true"
          @dragleave="isDragging = false"
        />
        <i class="pi pi-cloud-upload upload-icon"></i>
        <p>Arraste fotos aqui ou clique para selecionar</p>
        <Button label="Selecionar Fotos" @click="fileInput?.click()" />
      </div>

      <!-- Photos Grid -->
      <div v-if="projectPhotos.length > 0" class="photos-container">
        <div class="grid-header">
          <h3>{{ projectPhotos.length }} foto(s) carregada(s)</h3>
        </div>
        <div class="photos-grid">
          <div
            v-for="photo in projectPhotos"
            :key="photo.id"
            class="photo-card"
            @click="viewPhoto(photo)"
          >
            <div class="photo-wrapper">
              <img :src="getPhotoUrl(photo)" :alt="photo.filename" loading="lazy" />
              <div class="photo-overlay">
                <i class="pi pi-eye"></i>
              </div>
            </div>
            <p class="folder-label">{{ photo.folder }}</p>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <i class="pi pi-inbox empty-icon"></i>
        <p>Nenhuma foto ainda</p>
        <span class="hint">Comece carregando suas fotos acima</span>
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
        :disabled="projectPhotos.length === 0"
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
const isDragging = ref(false)
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
  // Reset input
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const handleDrop = async (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (!files) return

  const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))
  for (const file of imageFiles) {
    await photoStore.addPhoto(projectId.value, 'Inbox', file)
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
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-area {
  border: 2px dashed var(--p-primary-color);
  border-radius: 12px;
  padding: 2.5rem 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--p-surface-50);
}

.upload-area:hover,
.upload-area.drag-active {
  background: var(--p-primary-50);
  border-color: var(--p-primary-600);
  transform: scale(1.01);
}

.upload-icon {
  font-size: 2.5rem;
  color: var(--p-primary-color);
  display: block;
  margin-bottom: 0.75rem;
  transition: transform 0.3s ease;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-8px);
  }
}

.upload-area:hover .upload-icon {
  transform: scale(1.1);
}

.upload-area p {
  margin: 0.5rem 0 1.25rem;
  color: var(--p-text-color);
  font-size: 0.95rem;
}

.photos-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.grid-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.grid-header h3 {
  margin: 0;
  color: var(--p-text-color);
  font-size: 0.95rem;
  font-weight: 600;
}

.photos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
  flex: 1;
}

.photo-card {
  position: relative;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  background: var(--p-surface-100);
  transition: all 0.3s ease;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.photo-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.photo-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.photo-overlay i {
  color: white;
  font-size: 1.5rem;
  opacity: 0;
  transform: scale(0.8);
  transition: all 0.3s ease;
}

.photo-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: scale(1.02);
}

.photo-card:hover img {
  transform: scale(1.08);
}

.photo-card:hover .photo-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.photo-card:hover .photo-overlay i {
  opacity: 1;
  transform: scale(1);
}

.folder-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.4rem;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--p-text-color-secondary);
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--p-primary-color);
  opacity: 0.6;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.empty-state .hint {
  font-size: 0.85rem;
  color: var(--p-text-color-secondary);
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

  .upload-area {
    padding: 2rem 1rem;
  }

  .photos-grid {
    grid-template-columns: repeat(auto-fill, minmax(85px, 1fr));
    gap: 0.5rem;
  }

  .upload-icon {
    font-size: 2rem;
  }
}
</style>
