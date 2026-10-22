<template>
  <div class="empty-state">
    <i v-if="icon" :class="icon" class="empty-state-icon" />
    <p class="empty-state-title">{{ title }}</p>
    <p v-if="description" class="empty-state-desc">{{ description }}</p>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state-icon {
  font-size: 3rem;
  color: var(--p-text-muted-color);
  margin-bottom: 1rem;
}

.empty-state-title {
  font-size: 1.1rem;
  color: var(--p-text-color);
  margin-bottom: 0.25rem;
}

.empty-state-desc {
  color: var(--p-text-muted-color);
  max-width: 280px;
}
</style>
