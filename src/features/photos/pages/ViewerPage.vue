<template>
  <div class="viewer-page">
    <div v-if="photo" class="viewer-content">
      <img :src="photoUrl" :alt="photo.filename" class="photo-image" />
    </div>

    <div v-if="photo" class="viewer-info-bar">
      <span class="filename">{{ photo.filename }}</span>
      <span class="folder-tag">{{ photo.folder }}</span>
    </div>

    <div class="viewer-controls">
      <Button
        icon="pi pi-arrow-left"
        text
        size="small"
        label="Voltar"
        class="ctrl-btn"
        @click="goBack"
      />
      <Button
        v-if="photo?.folder !== 'Trash'"
        icon="pi pi-trash"
        text
        severity="danger"
        size="small"
        class="ctrl-btn"
        @click="deletePhoto"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import { usePhotosStore } from '../../../stores/photos'
import type { Photo } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const route = useRoute()
const photoStore = usePhotosStore()

const photo = ref<Photo | null>(null)
const photoUrl = ref<string>('')
const projectId = ref<string>('')

onMounted(async () => {
  projectId.value = route.params.projectId as string
  const photoId = route.params.photoId as string

  // Se fotos não carregadas, carregar
  if (photoStore.projectPhotos.length === 0) {
    await photoStore.loadPhotos(projectId.value)
  }

  const p = photoStore.projectPhotos.find(pp => pp.id === photoId)
  if (p) {
    photo.value = p
    photoUrl.value = URL.createObjectURL(p.data)
  }
})

const deletePhoto = async () => {
  if (photo.value && confirm('Tem certeza que deseja deletar esta foto?')) {
    await photoStore.deletePhoto(photo.value.id)
    goBack()
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.viewer-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #000;
}

.viewer-content {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.photo-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.viewer-info-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: rgba(0, 0, 0, 0.85);
}

.filename {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.folder-tag {
  background: var(--p-primary-color);
  color: white;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  font-size: 0.65rem;
  font-weight: 600;
  flex-shrink: 0;
}

.viewer-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  padding-bottom: calc(0.5rem + env(safe-area-inset-bottom, 0px));
  background: rgba(0, 0, 0, 0.9);
}

:deep(.ctrl-btn) {
  color: rgba(255, 255, 255, 0.85) !important;
  font-size: 0.8rem !important;
}
</style>
