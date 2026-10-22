<template>
  <div class="settings-page">
    <PageHeader title="Configurações" />

    <div class="settings-content">
      <Card title="Idioma">
        <div class="setting-group">
          <label>Escolha seu idioma:</label>
          <Dropdown
            :options="languages"
            option-label="label"
            option-value="value"
            :model-value="currentLanguage"
          />
        </div>
      </Card>

      <Card title="Sobre">
        <p>PWA Reports v1.0.0</p>
        <p style="font-size: 0.875rem; color: var(--p-text-color-secondary);">
          Organiza fotos de trabalho com triagem, revisão e exportação ZIP
        </p>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '../../../components/ui/PageHeader.vue'
import Card from 'primevue/card'
import Dropdown from 'primevue/dropdown'

const languages = [
  { label: 'Português', value: 'pt' },
  { label: 'English', value: 'en' },
]

const currentLanguage = ref('pt')
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.settings-content {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-group label {
  font-weight: 500;
  color: var(--p-text-color);
}
</style>
