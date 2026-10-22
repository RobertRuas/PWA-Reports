import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { db } from '../core/database/db'
import { MAPS } from '../core/database/schemas/project.schema'
import type { Project } from '../core/database/schemas/project.schema'

const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref<Project[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const projectCount = computed(() => projects.value.length)
  const sortedProjects = computed(() =>
    [...projects.value].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  )

  // Load all projects
  async function loadProjects() {
    loading.value = true
    error.value = null
    try {
      projects.value = await db.projects.toArray()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao carregar projetos'
      console.error('Error loading projects:', err)
    } finally {
      loading.value = false
    }
  }

  // Create project
  async function createProject(name: string, mapId: string): Promise<Project | null> {
    loading.value = true
    error.value = null
    try {
      const now = new Date().toISOString()
      const project: Project = {
        id: generateId(),
        name,
        mapId,
        createdAt: now,
        updatedAt: now,
      }

      await db.projects.add(project)
      projects.value.push(project)
      return project
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao criar projeto'
      console.error('Error creating project:', err)
      return null
    } finally {
      loading.value = false
    }
  }

  // Get project by ID
  async function getProject(id: string): Promise<Project | undefined> {
    return db.projects.get(id)
  }

  // Update project
  async function updateProject(id: string, updates: Partial<Project>) {
    loading.value = true
    error.value = null
    try {
      const now = new Date().toISOString()
      await db.projects.update(id, {
        ...updates,
        updatedAt: now,
      })

      const index = projects.value.findIndex(p => p.id === id)
      if (index !== -1) {
        projects.value[index] = {
          ...projects.value[index],
          ...updates,
          updatedAt: now,
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao atualizar projeto'
      console.error('Error updating project:', err)
    } finally {
      loading.value = false
    }
  }

  // Delete project
  async function deleteProject(id: string) {
    loading.value = true
    error.value = null
    try {
      await db.projects.delete(id)
      await db.photos.where('projectId').equals(id).delete()

      projects.value = projects.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro ao deletar projeto'
      console.error('Error deleting project:', err)
    } finally {
      loading.value = false
    }
  }

  // Get map info
  function getMapInfo(mapId: string) {
    return MAPS[mapId as keyof typeof MAPS] || null
  }

  return {
    // State
    projects,
    loading,
    error,

    // Computed
    projectCount,
    sortedProjects,

    // Methods
    loadProjects,
    createProject,
    getProject,
    updateProject,
    deleteProject,
    getMapInfo,
  }
})
