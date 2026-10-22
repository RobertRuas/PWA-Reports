<template>
  <div class="home-page">
    <!-- Modo de criação full-screen -->
    <div v-if="showCreateForm" class="create-page">
      <div class="create-page-header">
        <Button
          icon="pi pi-arrow-left"
          text
          rounded
          size="small"
          @click="showCreateForm = false"
        />
        <h2>Novo Projeto</h2>
        <div style="width: 32px;"></div>
      </div>

      <div class="create-page-content">
        <div class="create-illustration">
          <i class="pi pi-folder-plus"></i>
        </div>

        <div class="create-form-fields">
          <div class="form-field">
            <label>Nome do projeto</label>
            <InputText
              v-model="newProjectName"
              placeholder="Ex: Inspeção Ponte Norte"
              class="form-input"
            />
          </div>

          <div class="form-field">
            <label>Tipo de mapa</label>
            <Dropdown
              v-model="newProjectMapId"
              :options="mapOptions"
              option-label="label"
              option-value="value"
              class="form-input"
            />
          </div>
        </div>

        <div class="create-form-actions">
          <Button
            label="Criar Projeto"
            icon="pi pi-check"
            :loading="isCreating"
            :disabled="!newProjectName.trim()"
            class="create-submit-btn"
            @click="handleCreateProject"
          />
          <Button
            label="Cancelar"
            severity="secondary"
            text
            class="create-cancel-btn"
            @click="showCreateForm = false"
          />
        </div>
      </div>
    </div>

    <!-- Página principal -->
    <template v-else>
      <div class="content">
        <!-- Warning Banner -->
        <div v-if="projectsWithoutExport.length > 0" class="warning-banner">
          <i class="pi pi-info-circle"></i>
          <span>{{ projectsWithoutExport.length }} {{ projectsWithoutExport.length === 1 ? 'projeto não exportado' : 'projetos não exportados' }}</span>
        </div>

        <div v-if="sortedProjects.length === 0" class="empty-state">
          <i class="pi pi-inbox"></i>
          <h2>{{ t('home.empty_title') }}</h2>
          <p>{{ t('home.empty_message') }}</p>
          <Button
            :label="t('home.new_project')"
            icon="pi pi-plus"
            @click="showCreateForm = true"
          />
        </div>

        <div v-else class="projects-list">
          <div
            v-for="project in sortedProjects"
            :key="project.id"
            class="project-item"
            @click="selectProject(project.id)"
          >
            <div class="project-item-left">
              <div class="project-icon" :class="isProjectExported(project.id) ? 'exported' : 'pending'">
                <i :class="isProjectExported(project.id) ? 'pi pi-check' : 'pi pi-folder'"></i>
              </div>
              <div class="project-info">
                <h3>{{ project.name }}</h3>
                <span class="project-meta">
                  <i class="pi pi-map"></i>
                  {{ getMapInfo(project.mapId)?.name }}
                </span>
                <span class="project-date">{{ formatDate(project.createdAt) }}</span>
              </div>
            </div>
            <div class="project-item-right">
              <Button
                icon="pi pi-trash"
                text
                severity="danger"
                size="small"
                class="delete-btn"
                @click.stop="deleteProject(project.id)"
              />
              <i class="pi pi-chevron-right chevron"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- FAB com menu de opções -->
      <div v-if="sortedProjects.length > 0" class="fab-container">
        <!-- Menu do FAB -->
        <div v-if="showFabMenu" class="fab-menu-backdrop" @click="showFabMenu = false"></div>
        <div v-if="showFabMenu" class="fab-menu">
          <button class="fab-menu-item" @click="handleCreateNew">
            <i class="pi pi-plus"></i>
            <span>Criar novo projeto</span>
          </button>
          <button class="fab-menu-item" @click="handleImportZip">
            <i class="pi pi-file-import"></i>
            <span>Importar ZIP</span>
          </button>
        </div>
        <button
          class="fab"
          :class="{ active: showFabMenu }"
          @click="showFabMenu = !showFabMenu"
        >
          <i class="pi pi-plus" :class="{ rotated: showFabMenu }"></i>
        </button>
      </div>

      <!-- Input oculto para importar ZIP -->
      <input
        ref="zipInput"
        type="file"
        accept=".zip"
        hidden
        @change="handleZipImport"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Dropdown from 'primevue/dropdown'
import { useProjects } from '../../../composables/useProjects'
import { useI18nStore, translations } from '../../../stores/i18n'
import { usePhotosStore } from '../../../stores/photos'
import { MAPS } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const i18nStore = useI18nStore()
const photoStore = usePhotosStore()
const { sortedProjects, isCreating, createNewProject, deleteProjectItem, getMapInfo } = useProjects()

const showCreateForm = ref(false)
const showFabMenu = ref(false)
const newProjectName = ref('')
const newProjectMapId = ref('inspection-t24')
const zipInput = ref<HTMLInputElement>()

const projectsWithoutExport = computed(() => {
  return sortedProjects.value.filter((p: any) => {
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

const handleCreateNew = () => {
  showFabMenu.value = false
  showCreateForm.value = true
}

const handleImportZip = () => {
  showFabMenu.value = false
  zipInput.value?.click()
}

const handleZipImport = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  try {
    const JSZip = (await import('jszip')).default
    const zip = await JSZip.loadAsync(file)

    // Ler fastreport.json para obter metadata
    const metadataFile = zip.file('fastreport.json')
    let projectName = file.name.replace('.zip', '')
    let mapId = 'inspection-t24'

    if (metadataFile) {
      const metadata = JSON.parse(await metadataFile.async('string'))
      projectName = metadata.displayName || projectName
      mapId = metadata.mapId || mapId
    }

    // Criar projeto
    const project = await createNewProject(projectName, mapId)
    if (!project) {
      alert('Erro ao criar projeto')
      return
    }

    // Importar fotos de cada pasta
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']

    for (const [path, zipEntry] of Object.entries(zip.files)) {
      if (zipEntry.dir) continue

      const ext = '.' + path.split('.').pop()?.toLowerCase()
      if (!imageExtensions.includes(ext)) continue

      const parts = path.split('/')
      const folder = parts.length >= 2 ? parts[0] : 'Inbox'
      const blob = await zipEntry.async('blob')
      const photoFile = new File([blob], parts[parts.length - 1], { type: 'image/jpeg' })

      await photoStore.addPhoto(project.id, folder, photoFile, projectName)
    }

    // Navegar para o projeto importado
    router.push(`/project/${project.id}`)
  } catch (err) {
    console.error('Erro ao importar ZIP:', err)
    alert('Erro ao importar o ficheiro ZIP')
  }

  // Limpar input
  if (zipInput.value) {
    zipInput.value.value = ''
  }
}

const handleCreateProject = async () => {
  if (!newProjectName.value.trim()) return

  const project = await createNewProject(newProjectName.value, newProjectMapId.value)
  if (project) {
    showCreateForm.value = false
    newProjectName.value = ''
    newProjectMapId.value = 'inspection-t24'
    router.push(`/project/${project.id}`)
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
  min-height: 100%;
  background: var(--p-surface-0);
  position: relative;
  overscroll-behavior: none;
}

/* ========= Lista de projetos ========= */
.content {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overscroll-behavior: none;
}

.warning-banner {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff8e1;
  border-left: 3px solid #ff9800;
  border-radius: 6px;
  color: #856404;
  font-size: 0.8rem;
}

.warning-banner i {
  font-size: 0.9rem;
  color: #ff9800;
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--p-text-color);
  padding: 2rem 1rem;
}

.empty-state i {
  font-size: 3rem;
  color: var(--p-primary-color);
  margin-bottom: 1rem;
  opacity: 0.7;
}

.empty-state h2 {
  margin: 0.5rem 0;
  font-size: 1.1rem;
}

.empty-state p {
  margin-bottom: 1.5rem;
  color: var(--p-text-color-secondary);
  text-align: center;
  max-width: 260px;
  font-size: 0.85rem;
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 5rem;
}

.project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.project-item:active {
  background: var(--p-surface-100);
  transform: scale(0.98);
}

.project-item-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}

.project-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.project-icon.exported {
  background: var(--p-green-50, #ecfdf5);
  color: var(--p-green-600, #16a34a);
}

.project-icon.pending {
  background: var(--p-primary-50);
  color: var(--p-primary-color);
}

.project-icon i {
  font-size: 1rem;
}

.project-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}

.project-info h3 {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--p-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.project-meta {
  font-size: 0.75rem;
  color: var(--p-primary-color);
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.project-meta i {
  font-size: 0.65rem;
}

.project-date {
  font-size: 0.7rem;
  color: var(--p-text-color-secondary);
}

.project-item-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.delete-btn {
  opacity: 0.5;
  width: 28px !important;
  height: 28px !important;
}

.chevron {
  font-size: 0.75rem;
  color: var(--p-text-color-secondary);
  opacity: 0.5;
}

/* ========= FAB com menu ========= */
.fab-container {
  position: fixed;
  bottom: 20px;
  right: 16px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.fab-menu-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 49;
}

.fab-menu {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  animation: slideUp 0.2s ease;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.fab-menu-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.6rem 1rem;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--p-text-color);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  -webkit-tap-highlight-color: transparent;
  transition: all 0.15s;
}

.fab-menu-item:active {
  background: var(--p-surface-100);
  transform: scale(0.97);
}

.fab-menu-item i {
  font-size: 1rem;
  color: var(--p-primary-color);
}

.fab {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  border: none;
  background: var(--p-primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.fab:active {
  transform: scale(0.9);
}

.fab i {
  font-size: 1.25rem;
  transition: transform 0.2s ease;
}

.fab i.rotated {
  transform: rotate(45deg);
}

/* ========= Formulário full-screen ========= */
.create-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--p-surface-0);
}

.create-page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--p-surface-200);
}

.create-page-header h2 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.create-page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.25rem;
  gap: 1.5rem;
  overflow-y: auto;
}

.create-illustration {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.create-illustration i {
  font-size: 3.5rem;
  color: var(--p-primary-color);
  opacity: 0.7;
}

.create-form-fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-field label {
  font-weight: 500;
  color: var(--p-text-color);
  font-size: 0.85rem;
}

:deep(.form-input) {
  width: 100% !important;
  font-size: 16px !important;
}

:deep(.form-input .p-inputtext) {
  font-size: 16px !important;
}

.create-form-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding-bottom: 1rem;
}

.create-submit-btn {
  width: 100%;
  height: 48px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 12px;
}

.create-cancel-btn {
  width: 100%;
  height: 40px;
  font-size: 0.9rem;
}
</style>
