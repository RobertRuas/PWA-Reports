<template>
  <Toast />
  <ConfirmDialog />
  <router-view />
  <div v-if="updateAvailable" class="update-banner">
    <i class="pi pi-refresh" />
    <span>Nova versao disponivel</span>
    <Button size="small" @click="applyUpdate">Atualizar</Button>
    <Button size="small" text @click="dismissUpdate">Depois</Button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import Button from 'primevue/button'
import { usePwaUpdate } from '../composables/usePwaUpdate'
import { requestPersistentStorage } from '../core/storage/storage-manager'

const { updateAvailable, applyUpdate, dismissUpdate, onNeedRefresh } = usePwaUpdate()

onMounted(async () => {
  await requestPersistentStorage()

  if ('serviceWorker' in navigator) {
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg) {
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              onNeedRefresh()
            }
          })
        }
      })
    }
  }
})
</script>

<style scoped>
.update-banner {
  position: fixed;
  bottom: calc(52px + env(safe-area-inset-bottom, 0px));
  left: 1rem;
  right: 1rem;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  padding: 0.75rem 1rem;
  border-radius: var(--p-border-radius);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 9999;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.update-banner span {
  flex: 1;
  font-weight: 500;
}

@media (min-width: 992px) {
  .update-banner {
    bottom: 1rem;
    left: auto;
    right: 1rem;
    max-width: 400px;
  }
}
</style>
