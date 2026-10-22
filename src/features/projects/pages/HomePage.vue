<template>
  <div class="home-page">
    <PageHeader :title="t('home.title')" subtitle="PWA Reports" />

    <div class="content">
      <div v-if="sortedProjects.length === 0" class="empty-state">
        <i class="pi pi-inbox"></i>
        <h2>{{ t('home.empty_title') }}</h2>
        <p>{{ t('home.empty_message') }}</p>
        <Button
          :label="t('home.new_project')"
          icon="pi pi-plus"
          @click="showCreateDialog = true"
        />
      </div>

      <div v-else class="projects-grid">
        <div
          v-for="project in sortedProjects"
          :key="project.id"
          class="project-card"
          @click="selectProject(project.id)"
        >
          <div class="card-header">
            <h3>{{ project.name }}</h3>
            <Button
              icon="pi pi-trash"
              text
              severity="danger"
              size="small"
              @click.stop="deleteProject(project.id)"
            />
          </div>
          <p class="map-name">{{ getMapInfo(project.mapId)?.name }}</p>
          <p class="date">{{ formatDate(project.createdAt) }}</p>
        </div>

        <div class="add-project-card" @click="showCreateDialog = true">
          <i class="pi pi-plus"></i>
          <p>{{ t('home.new_project') }}</p>
        </div>
      </div>
    </div>
  </div>

  <Dialog
    v-model:visible="showCreateDialog"
    :header="t('home.create_project')"
    :modal="true"
  >
    <div class="create-form">
      <div class="form-group">
        <label>{{ t('home.project_name') }}</label>
        <InputText
          v-model="newProjectName"
          :placeholder="`Ex: ${t('home.project_name')}`"
        />
      </div>

      <div class="form-group">
        <label>{{ t('home.map_selection') }}</label>
        <Dropdown
          v-model="newProjectMapId"
          :options="mapOptions"
          option-label="label"
          option-value="value"
        />
      </div>

      <div style="margin-top: 1.5rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
        <Button
          :label="t('home.cancel')"
          severity="secondary"
          @click="showCreateDialog = false"
        />
        <Button
          :label="t('home.create')"
          @click="handleCreateProject"
          :loading="isCreating"
        />
      </div>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../../../components/ui/PageHeader.vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { useProjects } from '../../../composables/useProjects'
import { useI18nStore, translations } from '../../../stores/i18n'
import { MAPS } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const i18nStore = useI18nStore()
const { sortedProjects, isCreating, createNewProject, deleteProjectItem, getMapInfo } = useProjects()

const showCreateDialog = ref(false)
const newProjectName = ref('')
const newProjectMapId = ref('inspection-t24')

const t = (key: string) => {
  const keys = key.split('.')
  let obj: any = translations[i18nStore.locale]
  for (const k of keys) {
    obj = obj?.[k]
  }
  return obj || key
}

const mapOptions = computed(() =>
  Object.values(MAPS).map(map => ({
    label: map.name,
    value: map.id,
  }))
)

const handleCreateProject = async () => {
  if (!newProjectName.value.trim()) return

  const project = await createNewProject(newProjectName.value, newProjectMapId.value)
  if (project) {
    showCreateDialog.value = false
    newProjectName.value = ''
    newProjectMapId.value = 'inspection-t24'
  }
}

const selectProject = (projectId: string) => {
  router.push(`/project/${projectId}`)
}

const deleteProject = async (projectId: string) => {
  if (confirm(t('home.delete_confirm'))) {
    await deleteProjectItem(projectId)
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--p-text-color);
}

.empty-state i {
  font-size: 4rem;
  color: var(--p-primary-color);
  margin-bottom: 1rem;
}

.empty-state h2 {
  margin: 1rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin-bottom: 2rem;
  color: var(--p-text-color-secondary);
  text-align: center;
  max-width: 300px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  padding-bottom: 2rem;
}

.project-card,
.add-project-card {
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-border-radius);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover,
.add-project-card:hover {
  border-color: var(--p-primary-color);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 0.5rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--p-text-color);
}

.map-name {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: var(--p-primary-color);
  font-weight: 500;
}

.date {
  margin: 0.25rem 0 0;
  font-size: 0.8rem;
  color: var(--p-text-color-secondary);
}

.add-project-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 150px;
  border-style: dashed;
  background: var(--p-surface-0);
}

.add-project-card i {
  font-size: 2rem;
  color: var(--p-primary-color);
}

.add-project-card p {
  margin: 0;
  color: var(--p-primary-color);
  font-weight: 500;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: var(--p-text-color);
  font-size: 0.9rem;
}
</style>
