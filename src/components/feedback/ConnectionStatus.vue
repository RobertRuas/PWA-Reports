<template>
  <Tag
    :value="isOnline && isServerReachable ? 'Online' : 'Offline'"
    :icon="isOnline && isServerReachable ? 'pi pi-wifi' : 'pi pi-cloud-upload'"
    :severity="isOnline && isServerReachable ? 'success' : 'secondary'"
    rounded
  />
</template>

<script setup lang="ts">
import Tag from 'primevue/tag'
import { useConnectivity } from '../../core/network/connectivity'

const { isOnline, isServerReachable } = useConnectivity()
</script>
