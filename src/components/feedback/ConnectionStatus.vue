<template>
  <div class="connection-status" :title="tooltipText">
    <div class="status-indicator" :class="statusClass">
      <i :class="statusIcon"></i>
    </div>
    <div class="status-info">
      <div class="status-label">{{ statusLabel }}</div>
      <div class="status-time">{{ lastConnectionTime }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const isOnline = ref(true)
const lastConnectionTime = ref('')

const statusClass = computed(() => isOnline.value ? 'online' : 'offline')

const statusIcon = computed(() =>
  isOnline.value ? 'pi pi-circle-fill' : 'pi pi-circle'
)

const statusLabel = computed(() =>
  isOnline.value ? 'Online' : 'Offline'
)

const tooltipText = computed(() => {
  const lastTime = localStorage.getItem('lastOnlineTime')
  if (!lastTime) return `${statusLabel.value}`
  return `${statusLabel.value} · Última atualização: ${lastTime}`
})

const updateConnectionTime = () => {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  localStorage.setItem('lastOnlineTime', timeStr)
  lastConnectionTime.value = timeStr
}

const checkConnection = () => {
  // Check if online
  const online = navigator.onLine
  isOnline.value = online

  // Update time if online
  if (online) {
    updateConnectionTime()
  }

  // Load last connection time
  const stored = localStorage.getItem('lastOnlineTime')
  if (stored) {
    lastConnectionTime.value = stored
  }
}

onMounted(() => {
  checkConnection()

  window.addEventListener('online', checkConnection)
  window.addEventListener('offline', checkConnection)
})
</script>

<style scoped>
.connection-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: var(--p-surface-50);
  border-radius: 20px;
  cursor: help;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.status-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.5rem;
  transition: all 0.3s ease;
}

.status-indicator.online {
  background: var(--p-success-color);
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
  color: white;
}

.status-indicator.online i {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.status-indicator.offline {
  background: var(--p-surface-400);
  color: var(--p-text-color);
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.status-label {
  font-weight: 600;
  color: var(--p-text-color);
  line-height: 1;
}

.status-time {
  font-size: 0.65rem;
  color: var(--p-text-color-secondary);
  line-height: 1;
}

@media (max-width: 600px) {
  .connection-status {
    padding: 0.3rem 0.6rem;
    gap: 0.3rem;
  }

  .status-info {
    display: none;
  }

  .status-indicator {
    width: 8px;
    height: 8px;
  }
}
</style>
