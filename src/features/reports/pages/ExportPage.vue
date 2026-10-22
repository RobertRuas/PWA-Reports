<template>
  <div class="export-page">
    <div class="content">
      <!-- Info compacto horizontal -->
      <div class="export-summary">
        <div class="summary-item">
          <i class="pi pi-folder"></i>
          <span>{{ project?.name }}</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <i class="pi pi-images"></i>
          <span>{{ projectPhotos.length }} fotos</span>
        </div>
        <div class="summary-divider"></div>
        <div class="summary-item">
          <i class="pi pi-file"></i>
          <span>ZIP</span>
        </div>
      </div>

      <!-- Botões de ação -->
      <div class="action-buttons">
        <button class="action-btn download" :disabled="isExporting" @click="handleExport">
          <i :class="isExporting ? 'pi pi-spin pi-spinner' : 'pi pi-download'"></i>
          <span>{{ isExporting ? 'Baixando...' : 'Baixar ZIP' }}</span>
        </button>

        <button class="action-btn share" :disabled="isExporting" @click="handleShare">
          <i class="pi pi-share-alt"></i>
          <span>Compartilhar</span>
        </button>
      </div>

      <!-- Estrutura do ZIP -->
      <div v-if="project" class="structure-section">
        <div class="section-header">
          <i class="pi pi-sitemap"></i>
          <span>Estrutura do ZIP</span>
        </div>
        <pre class="structure-preview">{{ project.name }}/
├── fastreport.json
├── Inbox/
├── General/
├── Trash/
{{ project.mapId === 'inspection-t24' ? '├── T1/\n├── T2/\n...\n└── T24/' : '├── C12/\n├── C25/\n├── T01/\n...\n└── T09/' }}
</pre>
        <div class="compat-note">
          <i class="pi pi-check-circle"></i>
          <span>Compatível com FastReport para Mac</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePhotosStore } from '../../../stores/photos'
import { useProjectsStore } from '../../../stores/projects'
import type { Project } from '../../../core/database/schemas/project.schema'

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

// Gerar o blob ZIP reutilizável
const generateZipBlob = async (): Promise<Blob> => {
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

  return await zip.generateAsync({ type: 'blob' })
}

const handleExport = async () => {
  isExporting.value = true
  try {
    const content = await generateZipBlob()
    const url = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = url
    a.download = `${projectName.value}.zip`
    a.click()
    URL.revokeObjectURL(url)

    // Marcar como exportado
    localStorage.setItem(`project-exported-${projectId.value}`, 'true')
  } catch (err) {
    console.error('Erro ao exportar:', err)
    alert('Erro ao exportar projeto')
  } finally {
    isExporting.value = false
  }
}

const handleShare = async () => {
  // Verificar suporte ao Web Share API
  if (!navigator.share) {
    alert('Compartilhamento não suportado neste navegador. Use o botão Baixar.')
    return
  }

  isExporting.value = true
  try {
    const content = await generateZipBlob()
    const file = new File([content], `${projectName.value}.zip`, { type: 'application/zip' })

    await navigator.share({
      title: project.value?.name || 'Projeto',
      text: `Projeto ${project.value?.name} - PWA Reports`,
      files: [file],
    })

    // Marcar como exportado
    localStorage.setItem(`project-exported-${projectId.value}`, 'true')
  } catch (err: any) {
    // Ignorar cancelamento do usuário
    if (err.name !== 'AbortError') {
      console.error('Erro ao compartilhar:', err)
      alert('Erro ao compartilhar projeto')
    }
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
.export-page {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  overscroll-behavior: none;
}

.content {
  flex: 1;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  overflow-y: auto;
  overscroll-behavior: none;
}

/* ========= Resumo compacto horizontal ========= */
.export-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0.75rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 10px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex: 1;
  min-width: 0;
}

.summary-item i {
  font-size: 0.8rem;
  color: var(--p-primary-color);
  flex-shrink: 0;
}

.summary-item span {
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--p-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.summary-divider {
  width: 1px;
  height: 20px;
  background: var(--p-surface-300);
  flex-shrink: 0;
}

/* ========= Botões de ação ========= */
.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease;
}

.action-btn:active {
  transform: scale(0.97);
}

.action-btn:disabled {
  opacity: 0.6;
  pointer-events: none;
}

.action-btn.download {
  background: var(--p-primary-color);
  color: white;
}

.action-btn.share {
  background: var(--p-surface-100);
  color: var(--p-text-color);
  border: 1px solid var(--p-surface-300);
}

.action-btn i {
  font-size: 1rem;
}

/* ========= Estrutura ========= */
.structure-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--p-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.section-header i {
  font-size: 0.75rem;
}

.structure-preview {
  background: var(--p-surface-800);
  color: var(--p-surface-100);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
  line-height: 1.5;
  margin: 0;
}

.compat-note {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
  background: #ecfdf5;
  border-radius: 8px;
  font-size: 0.78rem;
  color: #065f46;
}

.compat-note i {
  font-size: 0.85rem;
  color: #059669;
}
</style>
