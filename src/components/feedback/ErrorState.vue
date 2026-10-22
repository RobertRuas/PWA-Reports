<template>
  <div class="error-state">
    <i class="pi pi-exclamation-circle error-state-icon" />
    <h3 class="error-state-title">{{ title }}</h3>
    <div class="error-state-desc-row">
      <p class="error-state-desc">{{ description }}</p>
      <Button
        v-if="description"
        icon="pi pi-copy"
        text
        rounded
        size="small"
        @click="copyToClipboard"
      />
    </div>
    <Button v-if="retryLabel" :label="retryLabel" outlined size="small" @click="$emit('retry')" />
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'

const toast = useToast()

const props = withDefaults(
  defineProps<{
    title?: string
    description?: string
    retryLabel?: string
  }>(),
  {
    title: 'Algo deu errado',
    description: 'Nao foi possivel completar a operacao.',
    retryLabel: '',
  },
)

defineEmits<{
  retry: []
}>()

async function copyToClipboard() {
  try {
    await navigator.clipboard.writeText(props.description)
    toast.add({ severity: 'success', summary: 'Copiado!', life: 2000 })
  } catch {
    toast.add({ severity: 'error', summary: 'Erro ao copiar', life: 2000 })
  }
}
</script>

<style scoped>
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  gap: 0.5rem;
}

.error-state-icon {
  font-size: 3rem;
  color: var(--p-red-500);
  margin-bottom: 0.5rem;
}

.error-state-title {
  margin: 0;
}

.error-state-desc-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  justify-content: center;
}

.error-state-desc {
  color: var(--p-text-muted-color);
  margin: 0;
  max-width: 280px;
}
</style>
