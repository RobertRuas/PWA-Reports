<template>
  <div class="home-page">
    <PageHeader :title="t('home.title')" subtitle="PWA Reports" />

    <div class="content">
      <!-- Warning Banner -->
      <div v-if="projectsWithoutExport.length > 0" class="warning-banner">
        <i class="pi pi-info-circle"></i>
        <span>{{ projectsWithoutExport.length }} {{ projectsWithoutExport.length === 1 ? 'projeto não exportado' : 'projetos não exportados' }}. Exporte antes de deletar.</span>
      </div>

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
          <div class="card-status">
            <div v-if="isProjectExported(project.id)" class="exported-badge">
              <i class="pi pi-check"></i> Exportado
            </div>
            <div v-else class="pending-badge">
              <i class="pi pi-exclamation-circle"></i> Não exportado
            </div>
          </div>

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

          <div class="card-info">
            <p class="map-name">
              <i class="pi pi-map"></i>
              {{ getMapInfo(project.mapId)?.name }}
            </p>
            <p class="date">
              <i class="pi pi-calendar"></i>
              {{ formatDate(project.createdAt) }}
            </p>
          </div>

          <div class="card-footer">
            <i class="pi pi-arrow-right"></i>
          </div>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '../../../components/ui/PageHeader.vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { useProjects } from '../../../composables/useProjects'
import { useI18nStore, translations } from '../../../stores/i18n'
import { useProjectsStore } from '../../../stores/projects'
import { MAPS } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const i18nStore = useI18nStore()
const projectsStore = useProjectsStore()
const { sortedProjects, isCreating, createNewProject, deleteProjectItem, getMapInfo } = useProjects()

// Force load projects on mount
onMounted(async () => {
  await projectsStore.loadProjects()
})

// Recarregar projetos quando houver mudanças no store
watch(() => projectsStore.projects, () => {}, { deep: true })

const showCreateDialog = ref(false)
const newProjectName = ref('')
const newProjectMapId = ref('inspection-t24')
const projectsWithoutExport = computed(() => {
  return sortedProjects.filter((p: any) => {
    const exported = localStorage.getItem(`project-exported-${p.id}`)
    return !exported
  })
})

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

const isProjectExported = (projectId: string) => {
  return localStorage.getItem(`project-exported-${projectId}`) === 'true'
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
  background: var(--p-surface-0);
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

.warning-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, #fff3cd, #ffe8a1);
  border-left: 4px solid #ff9800;
  border-radius: 8px;
  color: #856404;
  font-size: 0.9rem;
  animation: slideDown 0.3s ease;
}

.warning-banner i {
  font-size: 1.1rem;
  color: #ff9800;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--p-text-color);
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

.empty-state i {
  font-size: 3.5rem;
  color: var(--p-primary-color);
  margin-bottom: 1rem;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.empty-state h2 {
  margin: 1rem 0;
  font-size: 1.25rem;
}

.empty-state p {
  margin-bottom: 2rem;
  color: var(--p-text-color-secondary);
  text-align: center;
  max-width: 280px;
  font-size: 0.9rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 0.75rem;
  padding-bottom: 1rem;
}

.project-card,
.add-project-card {
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideIn 0.3s ease;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.project-card:hover,
.add-project-card:hover {
  border-color: var(--p-primary-color);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-4px);
}

.card-status {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  min-height: 20px;
}

.exported-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  background: var(--p-success-50);
  color: var(--p-success-700);
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

.exported-badge i {
  font-size: 0.75rem;
}

.pending-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.8rem;
  background: #fff3cd;
  color: #856404;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

.pending-badge i {
  font-size: 0.75rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  color: var(--p-text-color);
  word-break: break-word;
  font-weight: 700;
  flex: 1;
}

.card-header button {
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.3s ease;
}

.card-header button:hover {
  opacity: 1;
}

.card-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.map-name {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-primary-color);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.map-name i {
  font-size: 0.75rem;
}

.date {
  margin: 0;
  font-size: 0.8rem;
  color: var(--p-text-color-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.date i {
  font-size: 0.75rem;
}

.card-footer {
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--p-surface-200);
  display: flex;
  justify-content: flex-end;
  color: var(--p-primary-color);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover .card-footer {
  opacity: 1;
}

.add-project-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 120px;
  border-style: dashed;
  background: var(--p-surface-0);
}

.add-project-card i {
  font-size: 1.75rem;
  color: var(--p-primary-color);
  transition: transform 0.3s ease;
}

.add-project-card:hover i {
  transform: scale(1.1) rotate(90deg);
}

.add-project-card p {
  margin: 0;
  color: var(--p-primary-color);
  font-weight: 500;
  font-size: 0.85rem;
}

.create-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 100%;
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

:deep(.p-dialog) {
  width: 90vw !important;
  max-width: 500px !important;
}

:deep(.p-dialog-content) {
  padding: 1.5rem !important;
}

:deep(.p-inputtext) {
  width: 100% !important;
  font-size: 16px !important;
}

:deep(.p-dropdown) {
  width: 100% !important;
}

@media (max-width: 600px) {
  .content {
    padding: 0.75rem;
  }

  .projects-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 0.5rem;
  }

  .empty-state i {
    font-size: 3rem;
  }

  .empty-state h2 {
    font-size: 1.1rem;
  }
}
</style>
