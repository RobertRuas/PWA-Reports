<template>
  <div class="export-page">
    <PageHeader title="Exportar" subtitle="Gerar ZIP" />

    <div class="content">
      <Card class="export-card">
        <template #title>
          <i class="pi pi-download" style="margin-right: 0.5rem;"></i>
          Exportar Projeto
        </template>
        <template #content>
          <p>Prepare seu projeto para download. O arquivo ZIP contém todas as fotos organizadas em pastas.</p>

          <div class="export-info">
            <p><strong>Nome do projeto:</strong> {{ project?.name }}</p>
            <p><strong>Fotos:</strong> {{ projectPhotos.length }}</p>
            <p><strong>Formato:</strong> ZIP com estrutura de pastas</p>
          </div>

          <Button
            :label="isExporting ? 'Exportando...' : 'Baixar ZIP'"
            icon="pi pi-download"
            @click="handleExport"
            :loading="isExporting"
            class="export-button"
          />
        </template>
      </Card>

      <Card class="info-card" v-if="project">
        <template #title>
          <i class="pi pi-info-circle" style="margin-right: 0.5rem;"></i>
          Informações
        </template>
        <template #content>
          <p><strong>Estrutura do ZIP:</strong></p>
          <pre>{{ projectName }}/
├── fastreport.json
├── Inbox/
├── General/
├── Trash/
{{ project.mapId === 'inspection-t24' ? '├── T1/\n├── T2/\n...\n└── T24/' : '├── C12/\n├── C25/\n├── T01/\n...\n└── T09/' }}
</pre>
          <p style="margin-top: 1rem; font-size: 0.9rem; color: var(--p-text-color-secondary);">
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
  display: grid;
  gap: 1rem;
}

.export-card,
.info-card {
  background: var(--p-surface-50);
}

.export-info {
  margin: 1rem 0;
  padding: 1rem;
  background: var(--p-surface-100);
  border-radius: var(--p-border-radius);
}

.export-info p {
  margin: 0.5rem 0;
  color: var(--p-text-color);
}

.export-button {
  width: 100%;
  margin-top: 1rem;
}

.info-card pre {
  background: var(--p-surface-800);
  color: var(--p-surface-0);
  padding: 1rem;
  border-radius: var(--p-border-radius);
  overflow-x: auto;
  font-size: 0.85rem;
  font-family: monospace;
}

.nav-buttons {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  border-top: 1px solid var(--p-surface-200);
}

.nav-buttons button {
  flex: 1;
}
</style>
