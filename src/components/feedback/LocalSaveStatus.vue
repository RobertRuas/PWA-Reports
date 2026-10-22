<template>
  <Tag :value="statusText" :icon="statusIcon" :severity="statusSeverity" rounded />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'

const props = defineProps<{
  status?: 'saved' | 'saving' | 'error'
}>()

const currentStatus = computed(() => props.status ?? 'saved')

const statusText = computed(() => {
  const texts: Record<string, string> = {
    saved: 'Salvo neste dispositivo',
    saving: 'Salvando...',
    error: 'Falha ao salvar',
  }
  return texts[currentStatus.value] ?? ''
})

const statusIcon = computed(() => {
  const icons: Record<string, string> = {
    saved: 'pi pi-check-circle',
    saving: 'pi pi-sync',
    error: 'pi pi-exclamation-circle',
  }
  return icons[currentStatus.value] ?? 'pi pi-check-circle'
})

const statusSeverity = computed(() => {
  const severities: Record<string, string> = {
    saved: 'success',
    saving: 'secondary',
    error: 'danger',
  }
  return severities[currentStatus.value] ?? 'info'
})
</script>
