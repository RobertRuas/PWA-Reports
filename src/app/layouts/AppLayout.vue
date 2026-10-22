<template>
  <div class="app-layout">
    <!-- Top bar -->
    <div class="app-topbar">
      <Button
        icon="pi pi-bars"
        text
        rounded
        size="small"
        class="topbar-menu-btn"
        @click="drawerVisible = true"
      />
      <span class="topbar-title">{{ appConfig.name }}</span>
      <ConnectionStatus />
    </div>

    <!-- Sidebar drawer (mobile + tablet) -->
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

    <!-- Desktop sidebar -->
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

    <!-- Main content -->
    <main class="app-main">
      <router-view />
    </main>

    <!-- Mobile bottom tabs -->
    <div class="app-bottom-tabs">
      <button
        v-for="tab in bottomTabs"
        :key="tab.route"
        class="bottom-tab"
        :class="{ active: isActive(tab.route) }"
        @click="router.push(tab.route)"
      >
        <i :class="tab.icon" class="bottom-tab-icon" />
        <span class="bottom-tab-label">{{ tab.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import ConnectionStatus from '../../components/feedback/ConnectionStatus.vue'
import { appConfig } from '../config/app.config'

const router = useRouter()
const route = useRoute()
const drawerVisible = ref(false)

const navItems = [
  { label: 'Projetos', icon: 'pi pi-home', route: '/home' },
  { label: 'Configurações', icon: 'pi pi-cog', route: '/settings' },
]

const bottomTabs = [
  { label: 'Projetos', icon: 'pi pi-home', route: '/home' },
  { label: 'Config', icon: 'pi pi-cog', route: '/settings' },
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
  min-height: 100vh;
  min-height: 100dvh;
}

/* Top bar - compact for mobile */
.app-topbar {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 44px;
  padding: 0 0.6rem;
  background: var(--p-surface-0);
  border-bottom: 1px solid var(--p-surface-200);
  z-index: 100;
}

.topbar-title {
  font-weight: 700;
  font-size: 0.9rem;
  flex: 1;
}

.topbar-menu-btn {
  display: flex;
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

/* Desktop sidebar */
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

/* Navigation */
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

/* Main content */
.app-main {
  flex: 1;
  padding-top: 44px;
  padding-bottom: calc(48px + env(safe-area-inset-bottom, 0px));
  min-width: 0;
  overflow-y: auto;
}

/* Bottom tabs - compact */
.app-bottom-tabs {
  display: flex;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--p-surface-0);
  border-top: 1px solid var(--p-surface-200);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  z-index: 100;
}

.bottom-tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  padding: 0.3rem 0;
  background: none;
  border: none;
  color: var(--p-text-muted-color);
  cursor: pointer;
  font-size: inherit;
  -webkit-tap-highlight-color: transparent;
  transition: color 0.15s;
}

.bottom-tab.active {
  color: var(--p-primary-color);
}

.bottom-tab-icon {
  font-size: 1.1rem;
}

.bottom-tab-label {
  font-size: 0.6rem;
  font-weight: 500;
}

/* Desktop */
@media (min-width: 992px) {
  .app-topbar {
    display: none;
  }

  .topbar-menu-btn {
    display: none;
  }

  .app-sidebar {
    display: block;
  }

  .app-main {
    margin-left: 220px;
    padding-top: 0;
    padding-bottom: 0;
  }

  .app-bottom-tabs {
    display: none;
  }
}
</style>
