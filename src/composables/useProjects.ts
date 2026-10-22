import { onMounted, ref } from 'vue'
import { useProjectsStore } from '../stores/projects'
import { storeToRefs } from 'pinia'

export function useProjects() {
  const store = useProjectsStore()
  const { projects, loading, error, sortedProjects, projectCount } = storeToRefs(store)
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
    // State (reactive refs via storeToRefs)
    projects,
    loading,
    error,
    isCreating,

    // Computed (reactive refs via storeToRefs)
    projectCount,
    sortedProjects,

    // Methods
    createNewProject,
    deleteProjectItem,
    getMapInfo: store.getMapInfo,
  }
}
