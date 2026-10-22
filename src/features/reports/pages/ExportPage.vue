<template>
  <div class="export-page">
    <PageHeader title="Exportar" subtitle="Baixar Projeto" />

    <div class="content">
      <Card class="export-card">
        <template #title>
          <i class="pi pi-download" style="margin-right: 0.5rem;"></i>
          Exportar Projeto
        </template>
        <template #content>
          <p>Baixe seu projeto em formato ZIP com todas as fotos organizadas.</p>

          <div class="export-info">
            <div class="info-row">
              <span><i class="pi pi-folder"></i> Nome:</span>
              <strong>{{ project?.name }}</strong>
            </div>
            <div class="info-row">
              <span><i class="pi pi-images"></i> Fotos:</span>
              <strong>{{ projectPhotos.length }}</strong>
            </div>
            <div class="info-row">
              <span><i class="pi pi-file"></i> Tipo:</span>
              <strong>ZIP com pastas</strong>
            </div>
          </div>

          <Button
            :label="isExporting ? 'Baixando...' : 'Baixar ZIP'"
            icon="pi pi-download"
            :loading="isExporting"
            class="export-button"
            @click="handleExport"
          />
        </template>
      </Card>

      <Card v-if="project" class="info-card">
        <template #title>
          <i class="pi pi-info-circle" style="margin-right: 0.5rem;"></i>
          Estrutura
        </template>
        <template #content>
          <pre class="structure-preview">{{ projectName }}/
├── fastreport.json
├── Inbox/
├── General/
├── Trash/
{{ project.mapId === 'inspection-t24' ? '├── T1/\n├── T2/\n...\n└── T24/' : '├── C12/\n├── C25/\n├── T01/\n...\n└── T09/' }}
</pre>
          <p class="compat-note">
            <i class="pi pi-check"></i>
            Compatível com FastReport para Mac
          </p>
        </template>
      </Card>
    </div>

    <div class="nav-buttons">
      <Button
        icon="pi pi-arrow-left"
        label="Voltar"
        severity="secondary"
        @click="goBack"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '../../../components/ui/PageHeader.vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import { usePhotosStore } from '../../../stores/photos'
import { useProjectsStore } from '../../../stores/projects'
import type { Project } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const route = useRoute()
const photoStore = usePhotosStore()
const projectStore = useProjectsStore()

const projectId = ref<string>('')
const project = ref<Project | null>(null)
const isExporting = ref(false)
const { projectPhotos } = photoStore

const projectName = ref('projeto')

onMounted(async () => {
  projectId.value = route.params.projectId as string
  const p = await projectStore.getProject(projectId.value)
  if (p) {
    project.value = p
    projectName.value = p.name
  }
  await photoStore.loadPhotos(projectId.value)
})

const handleExport = async () => {
  isExporting.value = true
  try {
    // Dynamic import de JSZip
    const JSZip = (await import('jszip')).default

    const zip = new JSZip()

    // Adicionar fastreport.json
    const metadata = {
      createdAt: project.value?.createdAt || new Date().toISOString(),
      displayName: project.value?.name || 'Projeto',
      mapId: project.value?.mapId || 'inspection-t24',
      schemaVersion: 1,
    }
    zip.file('fastreport.json', JSON.stringify(metadata, null, 2))

    // Agrupar fotos por pasta
    const photosByFolder: Record<string, any[]> = {}
    projectPhotos.forEach(photo => {
      if (!photosByFolder[photo.folder]) {
        photosByFolder[photo.folder] = []
      }
      photosByFolder[photo.folder].push(photo)
    })

    // Adicionar pastas e fotos
    for (const [folder, photos] of Object.entries(photosByFolder)) {
      for (const photo of photos) {
        const arrayBuffer = await photo.data.arrayBuffer()
        zip.folder(folder)?.file(photo.filename, arrayBuffer)
      }
    }

    // Criar pastas vazias
    const emptyFolders = ['Inbox', 'General', 'Trash']
    emptyFolders.forEach(folder => {
      zip.folder(folder)
    })

    // Gerar e baixar ZIP
    const content = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.value}.zip`
    a.click()
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error('Erro ao exportar:', err)
    alert('Erro ao exportar projeto')
  } finally {
    isExporting.value = false
  }
}

const goBack = () => {
  router.push(`/project/${projectId.value}`)
}
</script>

<style scoped>
.export-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  overflow-x: hidden;
  display: grid;
  gap: 1rem;
  grid-template-columns: 1fr;
  max-width: 100%;
}

.export-card,
.info-card {
  background: var(--p-surface-50);
  animation: slideIn 0.3s ease;
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

.export-info {
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: var(--p-surface-100);
  border-radius: 8px;
  border-left: 4px solid var(--p-primary-color);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0.75rem 0;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--p-surface-200);
}

.info-row:last-child {
  border-bottom: none;
}

.info-row span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--p-text-color-secondary);
  font-size: 0.9rem;
}

.info-row i {
  color: var(--p-primary-color);
}

.info-row strong {
  color: var(--p-text-color);
  font-size: 1rem;
}

.export-button {
  width: 100%;
  height: 44px;
  margin-top: 1.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.structure-preview {
  background: var(--p-surface-800);
  color: var(--p-surface-0);
  padding: 1.25rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  margin: 1rem 0;
  border: 1px solid var(--p-surface-700);
}

.compat-note {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--p-success-50);
  border-left: 3px solid var(--p-success-color);
  border-radius: 4px;
  font-size: 0.9rem;
  color: var(--p-text-color);
}

.compat-note i {
  color: var(--p-success-color);
}

.nav-buttons {
  display: flex;
  gap: 0.75rem;
  padding: 1rem;
  border-top: 1px solid var(--p-surface-200);
  background: var(--p-surface-0);
}

.nav-buttons button {
  flex: 1;
  height: 44px;
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .content {
    padding: 0.75rem;
    gap: 0.75rem;
  }

  .export-info {
    padding: 1rem;
    margin: 1rem 0;
  }

  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .structure-preview {
    font-size: 0.8rem;
    padding: 1rem;
  }

  :deep(.p-card) {
    margin: 0 !important;
  }
}
</style>
