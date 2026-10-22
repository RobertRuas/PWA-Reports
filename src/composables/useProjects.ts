import { onMounted, ref } from 'vue'
import { useProjectsStore } from '../stores/projects'

export function useProjects() {
  const store = useProjectsStore()
  const isCreating = ref(false)

  onMounted(async () => {
    await store.loadProjects()
  })

  const createNewProject = async (name: string, mapId: string) => {
    isCreating.value = true
    try {
      const project = await store.createProject(name, mapId)
      return project
    } finally {
      isCreating.value = false
    }
  }

  const deleteProjectItem = async (projectId: string) => {
    await store.deleteProject(projectId)
  }

  return {
    // State
    projects: store.projects,
    loading: store.loading,
    error: store.error,
    isCreating,

    // Computed
    projectCount: store.projectCount,
    sortedProjects: store.sortedProjects,

    // Methods
    createNewProject,
    deleteProjectItem,
    getMapInfo: store.getMapInfo,
  }
}
