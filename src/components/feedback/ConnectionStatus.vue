<template>
  <div
    class="connection-chip"
    :class="isOnline ? 'online' : 'offline'"
    :title="tooltipText"
  >
    <span class="chip-dot"></span>
    <span class="chip-label">{{ chipLabel }}</span>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isOnline = ref(true)
const lastOnlineDate = ref<string | null>(null)
const lastOnlineTime = ref<string | null>(null)

// Quando offline, mostrar data e hora da última conexão
const chipLabel = computed(() => {
  if (isOnline.value) return 'Online'
  if (lastOnlineDate.value && lastOnlineTime.value) {
    return `Offline · ${lastOnlineDate.value} ${lastOnlineTime.value}`
  }
  return 'Offline'
})

const tooltipText = computed(() => {
  if (isOnline.value) return 'Conectado'
  if (lastOnlineDate.value && lastOnlineTime.value) {
    return `Última conexão: ${lastOnlineDate.value} às ${lastOnlineTime.value}`
  }
  return 'Sem conexão'
})

const updateConnectionTime = () => {
  const now = new Date()
  lastOnlineTime.value = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  })
  lastOnlineDate.value = now.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  })
  localStorage.setItem('lastOnlineTime', lastOnlineTime.value)
  localStorage.setItem('lastOnlineDate', lastOnlineDate.value)
}

const checkConnection = () => {
  isOnline.value = navigator.onLine
  if (isOnline.value) {
    updateConnectionTime()
  }
}

onMounted(() => {
  // Restaurar última conexão do localStorage
  lastOnlineTime.value = localStorage.getItem('lastOnlineTime')
  lastOnlineDate.value = localStorage.getItem('lastOnlineDate')
  checkConnection()
  window.addEventListener('online', checkConnection)
  window.addEventListener('offline', checkConnection)
})

onUnmounted(() => {
  window.removeEventListener('online', checkConnection)
  window.removeEventListener('offline', checkConnection)
})
</script>

<style scoped>
.connection-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: help;
  transition: all 0.3s ease;
  line-height: 1;
}

.connection-chip.online {
  background: #ecfdf5;
  color: #15803d;
}

.connection-chip.offline {
  background: #fefce8;
  color: #a16207;
}

.chip-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}

.connection-chip.online .chip-dot {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.5);
  animation: pulse-green 2s infinite;
}

.connection-chip.offline .chip-dot {
  background: #eab308;
  box-shadow: 0 0 6px rgba(234, 179, 8, 0.4);
  animation: pulse-yellow 2s infinite;
}

@keyframes pulse-green {
  0%, 100% { opacity: 1; box-shadow: 0 0 4px rgba(34, 197, 94, 0.4); }
  50% { opacity: 0.7; box-shadow: 0 0 8px rgba(34, 197, 94, 0.6); }
}

@keyframes pulse-yellow {
  0%, 100% { opacity: 1; box-shadow: 0 0 4px rgba(234, 179, 8, 0.3); }
  50% { opacity: 0.7; box-shadow: 0 0 8px rgba(234, 179, 8, 0.5); }
}

.chip-label {
  white-space: nowrap;
}
</style>
