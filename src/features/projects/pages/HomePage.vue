<template>
  <div class="home-page">
    <PageHeader title="PWA Reports" subtitle="Organize suas fotos de trabalho" />

    <div class="content">
      <div class="empty-state">
        <i class="pi pi-inbox"></i>
        <h2>Nenhum projeto ainda</h2>
        <p>Crie seu primeiro projeto para começar</p>
        <Button label="Novo Projeto" icon="pi pi-plus" @click="createProject" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PageHeader from '../../../components/ui/PageHeader.vue'
import Button from 'primevue/button'

const createProject = () => {
  console.log('Criar novo projeto')
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.empty-state {
  text-align: center;
  color: var(--p-text-color);
}

.empty-state i {
  font-size: 4rem;
  color: var(--p-primary-color);
  margin-bottom: 1rem;
  display: block;
}

.empty-state h2 {
  margin: 1rem 0;
  font-size: 1.5rem;
}

.empty-state p {
  margin-bottom: 2rem;
  color: var(--p-text-color-secondary);
}
</style>
