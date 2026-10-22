import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../core/database/db'
import type { Photo } from '../core/database/schemas/project.schema'
import { processImage, generatePhotoFilename } from '../core/utils/imageProcessor'

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

  // Adicionar foto com conversão automática para JPEG 1050p 80%
  async function addPhoto(
    projectId: string,
    folder: string,
    file: File,
    projectName?: string,
  ): Promise<Photo | null> {
    loading.value = true
    error.value = null
    try {
      // Converter imagem para JPEG 1050p 80% qualidade
      const processedBlob = await processImage(file)

      // Calcular ordem dentro da pasta
      const folderPhotos = photos.value.filter(
        p => p.projectId === projectId && p.folder === folder,
      )
      const order = folderPhotos.length + 1

      // Gerar nome do ficheiro previsível
      const filename = projectName
        ? generatePhotoFilename(projectName, folder, order)
        : file.name.replace(/\.[^.]+$/, '.jpeg')

      const now = new Date().toISOString()
      const photo: Photo = {
        id: generateId(),
        projectId,
        folder,
        filename,
        data: processedBlob,
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

  // Mover foto para outra pasta e atualizar nomes
  async function movePhoto(photoId: string, newFolder: string, projectName?: string) {
    loading.value = true
    error.value = null
    try {
      const now = new Date().toISOString()

      // Calcular nova ordem na pasta de destino
      const destPhotos = photos.value.filter(
        p => p.folder === newFolder && p.id !== photoId,
      )
      const newOrder = destPhotos.length + 1
      const newFilename = projectName
        ? generatePhotoFilename(projectName, newFolder, newOrder)
        : undefined

      const updateData: Record<string, unknown> = {
        folder: newFolder,
        updatedAt: now,
      }
      if (newFilename) {
        updateData.filename = newFilename
      }

      await db.photos.update(photoId, updateData)

      const index = photos.value.findIndex(p => p.id === photoId)
      if (index !== -1) {
        photos.value[index].folder = newFolder
        photos.value[index].updatedAt = now
        if (newFilename) {
          photos.value[index].filename = newFilename
        }
      }

      // Renumerar fotos na pasta de origem (manter nomes consistentes)
      if (projectName) {
        await renumberFolderPhotos(photos.value[index]?.projectId || '', newFolder, projectName)
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao mover foto'
      console.error('Error moving photo:', err)
    } finally {
      loading.value = false
    }
  }

  // Renumerar fotos dentro de uma pasta para manter nomes consistentes
  async function renumberFolderPhotos(projectId: string, folder: string, projectName: string) {
    const folderPhotos = photos.value.filter(
      p => p.projectId === projectId && p.folder === folder,
    )
    for (let i = 0; i < folderPhotos.length; i++) {
      const newFilename = generatePhotoFilename(projectName, folder, i + 1)
      if (folderPhotos[i].filename !== newFilename) {
        folderPhotos[i].filename = newFilename
        await db.photos.update(folderPhotos[i].id, { filename: newFilename })
      }
    }
  }

  // Eliminar foto
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

  // Eliminar múltiplas fotos
  async function deletePhotos(photoIds: string[]) {
    loading.value = true
    error.value = null
    try {
      await db.photos.bulkDelete(photoIds)
      photos.value = photos.value.filter(p => !photoIds.includes(p.id))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar fotos'
      console.error('Error deleting photos:', err)
    } finally {
      loading.value = false
    }
  }

  // Mover múltiplas fotos para Inbox (descategorizar)
  async function uncategorizePhotos(photoIds: string[]) {
    loading.value = true
    error.value = null
    try {
      const now = new Date().toISOString()
      for (const id of photoIds) {
        await db.photos.update(id, { folder: 'Inbox', updatedAt: now })
        const idx = photos.value.findIndex(p => p.id === id)
        if (idx !== -1) {
          photos.value[idx].folder = 'Inbox'
          photos.value[idx].updatedAt = now
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao descategorizar fotos'
      console.error('Error uncategorizing photos:', err)
    } finally {
      loading.value = false
    }
  }

  // Obter blob da foto
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
    deletePhotos,
    uncategorizePhotos,
    getPhotoBlob,
    renumberFolderPhotos,
  }
})
