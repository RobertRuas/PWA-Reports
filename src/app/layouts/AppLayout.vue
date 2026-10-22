<template>
  <div class="app-layout">
    <!-- Barra superior fixa -->
    <div class="app-topbar">
      <Button
        icon="pi pi-bars"
        text
        rounded
        class="topbar-menu-btn"
        @click="drawerVisible = true"
      />
      <span class="topbar-title">{{ appConfig.name }}</span>
      <ConnectionStatus />
    </div>

    <!-- Drawer lateral (mobile + tablet) -->
    <Drawer v-model:visible="drawerVisible" :modal="true" class="app-drawer">
      <template #header>
        <div class="drawer-header">
          <i class="pi pi-box" style="font-size: 1.25rem; color: var(--p-primary-color);" />
          <span class="drawer-app-name">{{ appConfig.name }}</span>
        </div>
      </template>
      <nav class="nav-list">
        <div
          v-for="item in navItems"
          :key="item.route"
          class="nav-item"
          :class="{ active: isActive(item.route) }"
          @click="navigateTo(item.route)"
        >
          <i :class="item.icon" class="nav-icon" />
          <span>{{ item.label }}</span>
        </div>
      </nav>
    </Drawer>

    <!-- Sidebar desktop -->
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <i class="pi pi-box" style="font-size: 1.25rem; color: var(--p-primary-color);" />
        <span class="sidebar-app-name">{{ appConfig.name }}</span>
      </div>
      <nav class="nav-list">
        <div
          v-for="item in navItems"
          :key="item.route"
          class="nav-item"
          :class="{ active: isActive(item.route) }"
          @click="navigateTo(item.route)"
        >
          <i :class="item.icon" class="nav-icon" />
          <span>{{ item.label }}</span>
        </div>
      </nav>
    </aside>

    <!-- Breadcrumb abaixo da topbar -->
    <div class="app-breadcrumb-bar">
      <AppBreadcrumb />
    </div>

    <!-- Conteúdo principal -->
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import ConnectionStatus from '../../components/feedback/ConnectionStatus.vue'
import AppBreadcrumb from '../../components/ui/AppBreadcrumb.vue'
import { appConfig } from '../config/app.config'

const router = useRouter()
const route = useRoute()
const drawerVisible = ref(false)

const navItems = [
  { label: 'Projetos', icon: 'pi pi-home', route: '/home' },
  { label: 'Configurações', icon: 'pi pi-cog', route: '/settings' },
]

function isActive(path: string): boolean {
  return route.path === path || route.path.startsWith(path + '/')
}

function navigateTo(path: string) {
  drawerVisible.value = false
  router.push(path)
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
  overscroll-behavior: none;
}

/* Barra superior - maior e fixa */
.app-topbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 52px;
  padding: 0 0.75rem;
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-200);
  z-index: 100;
}

.topbar-title {
  font-weight: 700;
  font-size: 1rem;
  flex: 1;
}

/* Ícone de menu maior */
:deep(.topbar-menu-btn) {
  width: 40px !important;
  height: 40px !important;
}

:deep(.topbar-menu-btn .p-button-icon) {
  font-size: 1.25rem !important;
}

/* Breadcrumb bar abaixo da topbar */
.app-breadcrumb-bar {
  position: fixed;
  top: 52px;
  left: 0;
  right: 0;
  z-index: 99;
  background: var(--p-surface-0);
}

/* Drawer */
.drawer-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.drawer-app-name {
  font-weight: 700;
  font-size: 1rem;
}

/* Sidebar desktop */
.app-sidebar {
  display: none;
  width: 220px;
  min-width: 220px;
  background: var(--p-surface-0);
  border-right: 1px solid var(--p-surface-200);
  padding: 1rem 0;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  overflow-y: auto;
  z-index: 50;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1.25rem 1.25rem;
}

.sidebar-app-name {
  font-weight: 700;
  font-size: 1rem;
}

/* Navegação */
.nav-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0 0.75rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--p-border-radius);
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--p-text-color);
  transition: background 0.15s;
  -webkit-tap-highlight-color: transparent;
}

.nav-item:hover {
  background: var(--p-surface-100);
}

.nav-item.active {
  background: var(--p-primary-50);
  color: var(--p-primary-color);
  font-weight: 600;
}

.nav-icon {
  font-size: 1rem;
  width: 1.125rem;
  text-align: center;
}

/* Conteúdo principal - sem bottom tabs */
.app-main {
  flex: 1;
  /* topbar 52px + breadcrumb ~34px */
  padding-top: 86px;
  min-width: 0;
  overscroll-behavior: none;
}

/* Desktop */
@media (min-width: 992px) {
  .app-topbar {
    display: none;
  }

  .app-breadcrumb-bar {
    display: none;
  }

  .app-sidebar {
    display: block;
  }

  .app-main {
    margin-left: 220px;
    padding-top: 0;
  }
}
</style>
