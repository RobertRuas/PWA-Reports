import { ref } from 'vue'

export function usePwaUpdate() {
  const updateAvailable = ref(false)

  const applyUpdate = () => {
    window.location.reload()
  }

  const dismissUpdate = () => {
    updateAvailable.value = false
  }

  const onNeedRefresh = () => {
    updateAvailable.value = true
  }

  return {
    updateAvailable,
    applyUpdate,
    dismissUpdate,
    onNeedRefresh,
  }
}
