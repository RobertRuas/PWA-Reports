<template>
  <nav v-if="items.length > 0" class="app-breadcrumb">
    <template v-for="(item, index) in items" :key="index">
      <span
        v-if="index < items.length - 1"
        class="breadcrumb-link"
        @click="router.push(item.route)"
      >
        <i v-if="item.icon" :class="item.icon" class="breadcrumb-icon" />
        {{ item.label }}
      </span>
      <span v-else class="breadcrumb-current">
        <i v-if="item.icon && items.length === 1" :class="item.icon" class="breadcrumb-icon" />
        {{ item.label }}
      </span>
      <i v-if="index < items.length - 1" class="pi pi-chevron-right breadcrumb-separator" />
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

interface BreadcrumbItem {
  label: string
  route: string
  icon?: string
}

// Gerar breadcrumbs baseados na rota atual
const items = computed<BreadcrumbItem[]>(() => {
  const path = route.path
  const crumbs: BreadcrumbItem[] = []

  // Página inicial
  if (path === '/home' || path === '/') {
    crumbs.push({ label: 'Projetos', route: '/home', icon: 'pi pi-home' })
    return crumbs
  }

  // Configurações
  if (path === '/settings') {
    crumbs.push({ label: 'Projetos', route: '/home', icon: 'pi pi-home' })
    crumbs.push({ label: 'Configurações', route: '/settings' })
    return crumbs
  }

  // Rotas de projeto
  const projectMatch = path.match(/^\/project\/([^/]+)(.*)$/)
  if (projectMatch) {
    const projectId = projectMatch[1]
    const subPath = projectMatch[2]

    crumbs.push({ label: 'Projetos', route: '/home', icon: 'pi pi-home' })
    crumbs.push({ label: 'Projeto', route: `/project/${projectId}` })

    if (subPath === '/triage') {
      crumbs.push({ label: 'Importar Fotos', route: `/project/${projectId}/triage` })
    } else if (subPath === '/review') {
      crumbs.push({ label: 'Revisão', route: `/project/${projectId}/review` })
    } else if (subPath === '/export') {
      crumbs.push({ label: 'Exportar', route: `/project/${projectId}/export` })
    } else if (subPath.startsWith('/viewer/')) {
      crumbs.push({ label: 'Revisão', route: `/project/${projectId}/review` })
      crumbs.push({ label: 'Visualizar', route: path })
    }

    return crumbs
  }

  return crumbs
})
</script>

<style scoped>
.app-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  font-size: 0.8rem;
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-100);
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.app-breadcrumb::-webkit-scrollbar {
  display: none;
}

.breadcrumb-link {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--p-primary-color);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  font-weight: 500;
}

.breadcrumb-link:active {
  opacity: 0.7;
}

.breadcrumb-current {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--p-text-color);
  font-weight: 600;
}

.breadcrumb-icon {
  font-size: 0.75rem;
}

.breadcrumb-separator {
  font-size: 0.55rem;
  color: var(--p-text-color-secondary);
  opacity: 0.5;
}
</style>
