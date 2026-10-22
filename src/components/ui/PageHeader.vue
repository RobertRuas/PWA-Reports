<template>
  <div class="page-header">
    <div class="page-header-left">
      <Button
        v-if="showBack"
        icon="pi pi-arrow-left"
        text
        rounded
        size="small"
        @click="router.push(backHref)"
      />
      <div>
        <h1 class="page-header-title">{{ title }}</h1>
        <p v-if="subtitle" class="page-header-subtitle">{{ subtitle }}</p>
      </div>
    </div>
    <div class="page-header-actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const router = useRouter()

withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    showBack?: boolean
    backHref?: string
  }>(),
  {
    subtitle: '',
    showBack: false,
    backHref: '/',
  },
)
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  gap: 0.75rem;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.page-header-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.page-header-subtitle {
  font-size: 0.75rem;
  color: var(--p-text-muted-color);
  margin: 0.1rem 0 0;
}

.page-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}
</style>
