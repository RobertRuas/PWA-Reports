import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../core/database/db'
import type { Photo } from '../core/database/schemas/project.schema'

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const usePhotosStore = defineStore('photos', () => {
  const photos = ref<Photo[]>([])
  const currentProjectId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const projectPhotos = computed(() =>
    photos.value.filter(p => p.projectId === currentProjectId.value)
  )

  const photosByFolder = computed(() => {
    const grouped: Record<string, Photo[]> = {}
    projectPhotos.value.forEach(photo => {
      if (!grouped[photo.folder]) {
        grouped[photo.folder] = []
      }
      grouped[photo.folder].push(photo)
    })
    return grouped
  })

  // Load photos for project
  async function loadPhotos(projectId: string) {
    currentProjectId.value = projectId
    loading.value = true
    error.value = null
    try {
      photos.value = await db.photos.where('projectId').equals(projectId).toArray()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar fotos'
      console.error('Error loading photos:', err)
    } finally {
      loading.value = false
    }
  }

  // Add photo
  async function addPhoto(projectId: string, folder: string, file: File): Promise<Photo | null> {
    loading.value = true
    error.value = null
    try {
      const now = new Date().toISOString()
      const photo: Photo = {
        id: generateId(),
        projectId,
        folder,
        filename: file.name,
        data: file,
        createdAt: now,
        updatedAt: now,
      }

      await db.photos.add(photo)
      if (projectId === currentProjectId.value) {
        photos.value.push(photo)
      }
      return photo
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao adicionar foto'
      console.error('Error adding photo:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Move photo to folder
  async function movePhoto(photoId: string, newFolder: string) {
    loading.value = true
    error.value = null
    try {
      const now = new Date().toISOString()
      await db.photos.update(photoId, {
        folder: newFolder,
        updatedAt: now,
      })

      const index = photos.value.findIndex(p => p.id === photoId)
      if (index !== -1) {
        photos.value[index].folder = newFolder
        photos.value[index].updatedAt = now
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao mover foto'
      console.error('Error moving photo:', err)
    } finally {
      loading.value = false
    }
  }

  // Delete photo
  async function deletePhoto(photoId: string) {
    loading.value = true
    error.value = null
    try {
      await db.photos.delete(photoId)
      photos.value = photos.value.filter(p => p.id !== photoId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar foto'
      console.error('Error deleting photo:', err)
    } finally {
      loading.value = false
    }
  }

  // Get photo blob
  async function getPhotoBlob(photoId: string): Promise<Blob | null> {
    try {
      const photo = await db.photos.get(photoId)
      return photo?.data || null
    } catch (err) {
      console.error('Error getting photo blob:', err)
      return null
    }
  }

  return {
    // State
    photos,
    currentProjectId,
    loading,
    error,

    // Computed
    projectPhotos,
    photosByFolder,

    // Methods
    loadPhotos,
    addPhoto,
    movePhoto,
    deletePhoto,
    getPhotoBlob,
  }
})
