<template>
  <div class="viewer-page">
    <div v-if="photo" class="viewer-content">
      <img :src="photoUrl" :alt="photo.filename" class="photo-image" />
      <div class="photo-info">
        <p><strong>{{ photo.filename }}</strong></p>
        <p>{{ photo.folder }}</p>
        <p class="date">{{ formatDate(photo.createdAt) }}</p>
      </div>
    </div>

    <div class="viewer-controls">
      <Button
        icon="pi pi-arrow-left"
        text
        @click="goBack"
      />
      <Button
        v-if="photo?.folder !== 'Trash'"
        icon="pi pi-trash"
        text
        severity="danger"
        @click="deletePhoto"
      />
      <Button
        icon="pi pi-arrow-right"
        text
        @click="goBack"
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

  const p = photoStore.projectPhotos.find(pp => pp.id === photoId)
  if (p) {
    photo.value = p
    photoUrl.value = URL.createObjectURL(p.data)
  }
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const deletePhoto = async () => {
  if (photo.value && confirm('Tem certeza que deseja deletar esta foto?')) {
    await photoStore.deletePhoto(photo.value.id)
    goBack()
  }
}

const goBack = () => {
  router.push(`/project/${projectId.value}/review`)
}
</script>

<style scoped>
.viewer-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--p-surface-900);
}

.viewer-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: auto;
}

.photo-image {
  max-width: 90vw;
  max-height: 80vh;
  object-fit: contain;
  border-radius: var(--p-border-radius);
}

.photo-info {
  margin-top: 1rem;
  text-align: center;
  color: var(--p-surface-0);
}

.photo-info p {
  margin: 0.25rem 0;
}

.photo-info strong {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.date {
  font-size: 0.8rem;
  opacity: 0.7;
}

.viewer-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--p-surface-800);
  border-top: 1px solid var(--p-surface-700);
}

:deep(.p-button) {
  color: var(--p-surface-0);
}
</style>
