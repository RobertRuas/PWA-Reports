<template>
  <div class="project-page">
    <PageHeader
      :title="project?.name || 'Projeto'"
      :subtitle="getMapInfo(project?.mapId || '')?.name"
      :show-back="true"
      back-href="/home"
    />

    <div class="content">
      <!-- Stats compactos -->
      <div class="stats-row">
        <div class="stat-chip">
          <i class="pi pi-images"></i>
          <span>{{ allPhotos.length }}</span>
          <small>total</small>
        </div>
        <div class="stat-chip inbox">
          <i class="pi pi-inbox"></i>
          <span>{{ inboxCount }}</span>
          <small>inbox</small>
        </div>
        <div class="stat-chip done">
          <i class="pi pi-check"></i>
          <span>{{ organizedCount }}</span>
          <small>feitas</small>
        </div>
      </div>

      <!-- Ações -->
      <div class="actions-list">
        <button class="action-item" @click="goToTriage">
          <div class="action-icon triage">
            <i class="pi pi-camera"></i>
          </div>
          <div class="action-text">
            <strong>Triagem</strong>
            <span>Envie fotos da galeria</span>
          </div>
          <i class="pi pi-chevron-right action-arrow"></i>
        </button>

        <button class="action-item" @click="goToReview">
          <div class="action-icon review">
            <i class="pi pi-images"></i>
          </div>
          <div class="action-text">
            <strong>Revisão</strong>
            <span>Classifique fotos por pasta</span>
          </div>
          <span v-if="inboxCount > 0" class="action-badge">{{ inboxCount }}</span>
          <i class="pi pi-chevron-right action-arrow"></i>
        </button>

        <button class="action-item" @click="goToExport">
          <div class="action-icon export">
            <i class="pi pi-download"></i>
          </div>
          <div class="action-text">
            <strong>Exportar</strong>
            <span>Baixe ZIP para FastReport</span>
          </div>
          <i class="pi pi-chevron-right action-arrow"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '../../../components/ui/PageHeader.vue'
import { useProjectsStore } from '../../../stores/projects'
import { usePhotosStore } from '../../../stores/photos'
import type { Project } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectsStore()
const photoStore = usePhotosStore()

const projectId = ref<string>('')
const project = ref<Project | null>(null)

const allPhotos = computed(() => photoStore.projectPhotos)
const photosByFolder = computed(() => photoStore.photosByFolder)

const inboxCount = computed(() => {
  return photosByFolder.value['Inbox']?.length || 0
})

const organizedCount = computed(() => {
  return allPhotos.value.reduce((sum, photo) => {
    return photo.folder !== 'Inbox' && photo.folder !== 'Trash' ? sum + 1 : sum
  }, 0)
})

onMounted(async () => {
  projectId.value = route.params.projectId as string
  const p = await projectStore.getProject(projectId.value)
  if (p) {
    project.value = p
  }
  await photoStore.loadPhotos(projectId.value)
})

const getMapInfo = (mapId: string) => {
  return projectStore.getMapInfo(mapId)
}

const goToTriage = () => {
  router.push(`/project/${projectId.value}/triage`)
}

const goToReview = () => {
  router.push(`/project/${projectId.value}/review`)
}

const goToExport = () => {
  router.push(`/project/${projectId.value}/export`)
}
</script>

<style scoped>
.project-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  flex: 1;
  padding: 0.75rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ========= Stats ========= */
.stats-row {
  display: flex;
  gap: 0.5rem;
}

.stat-chip {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  padding: 0.6rem 0.4rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 10px;
}

.stat-chip i {
  font-size: 1rem;
  color: var(--p-primary-color);
}

.stat-chip span {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--p-text-color);
}

.stat-chip small {
  font-size: 0.65rem;
  color: var(--p-text-color-secondary);
  text-transform: uppercase;
  font-weight: 500;
}

.stat-chip.inbox i {
  color: #f59e0b;
}

.stat-chip.done i {
  color: #22c55e;
}

/* ========= Actions ========= */
.actions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.action-item:active {
  background: var(--p-surface-100);
  transform: scale(0.98);
}

.action-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon.triage {
  background: #ede9fe;
  color: #7c3aed;
}

.action-icon.review {
  background: #dbeafe;
  color: #2563eb;
}

.action-icon.export {
  background: #d1fae5;
  color: #059669;
}

.action-icon i {
  font-size: 1.1rem;
}

.action-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.action-text strong {
  font-size: 0.9rem;
  color: var(--p-text-color);
}

.action-text span {
  font-size: 0.75rem;
  color: var(--p-text-color-secondary);
}

.action-badge {
  background: #f59e0b;
  color: white;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 0.15rem 0.45rem;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.action-arrow {
  color: var(--p-text-color-secondary);
  opacity: 0.4;
  font-size: 0.8rem;
}
</style>
