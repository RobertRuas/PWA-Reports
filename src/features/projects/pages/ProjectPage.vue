<template>
  <div class="project-page">
    <PageHeader :title="project?.name || 'Projeto'" :subtitle="getMapInfo(project?.mapId || '')?.name" />

    <div class="content">
      <div class="project-stats">
        <div class="stat-card">
          <i class="pi pi-images"></i>
          <p class="stat-number">{{ projectPhotos.length }}</p>
          <p class="stat-label">Fotos</p>
        </div>
        <div class="stat-card">
          <i class="pi pi-inbox"></i>
          <p class="stat-number">{{ photosByFolder['Inbox']?.length || 0 }}</p>
          <p class="stat-label">Inbox</p>
        </div>
        <div class="stat-card">
          <i class="pi pi-check"></i>
          <p class="stat-number">{{ totalOrganized }}</p>
          <p class="stat-label">Organizadas</p>
        </div>
      </div>

      <div class="actions-grid">
        <Card class="action-card" @click="goToTriage">
          <template #content>
            <i class="pi pi-download"></i>
            <h3>Triagem</h3>
            <p>Envie fotos e organizeas no Inbox</p>
          </template>
        </Card>

        <Card class="action-card" @click="goToReview">
          <template #content>
            <i class="pi pi-th"></i>
            <h3>Revisão</h3>
            <p>Organize fotos em pastas arrastandas</p>
          </template>
        </Card>

        <Card class="action-card" @click="goToExport">
          <template #content>
            <i class="pi pi-download"></i>
            <h3>Exportar</h3>
            <p>Baixe um ZIP pronto para FastReport</p>
          </template>
        </Card>
      </div>
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
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PageHeader from '../../../components/ui/PageHeader.vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import { useProjectsStore } from '../../../stores/projects'
import { usePhotosStore } from '../../../stores/photos'
import type { Project } from '../../../core/database/schemas/project.schema'

const router = useRouter()
const route = useRoute()
const projectStore = useProjectsStore()
const photoStore = usePhotosStore()

const projectId = ref<string>('')
const project = ref<Project | null>(null)
const { projectPhotos, photosByFolder } = photoStore

const totalOrganized = computed(() => {
  return projectPhotos.reduce((sum, photo) => {
    return photo.folder !== 'Inbox' ? sum + 1 : sum
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

const goBack = () => {
  router.push('/home')
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
  padding: 1rem;
  overflow-y: auto;
}

.project-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: var(--p-surface-50);
  border: 1px solid var(--p-surface-200);
  border-radius: var(--p-border-radius);
  padding: 1.5rem;
  text-align: center;
}

.stat-card i {
  font-size: 2rem;
  color: var(--p-primary-color);
  display: block;
  margin-bottom: 0.5rem;
}

.stat-number {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--p-text-color);
}

.stat-label {
  margin: 0.5rem 0 0;
  font-size: 0.85rem;
  color: var(--p-text-color-secondary);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.action-card {
  cursor: pointer;
  transition: all 0.2s;
  background: var(--p-surface-50);
}

.action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

:deep(.action-card .p-card-content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1rem;
}

.action-card i {
  font-size: 2.5rem;
  color: var(--p-primary-color);
  margin-bottom: 1rem;
}

.action-card h3 {
  margin: 0 0 0.5rem;
  color: var(--p-text-color);
}

.action-card p {
  margin: 0;
  font-size: 0.85rem;
  color: var(--p-text-color-secondary);
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
