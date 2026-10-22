import { ref, readonly, onMounted, onUnmounted } from 'vue'

const isOnline = ref(navigator.onLine)
const isServerReachable = ref(false)
const isCheckingServer = ref(false)
const lastChecked = ref<string | null>(null)

let checkTimer: ReturnType<typeof setTimeout> | null = null
let listenerCount = 0

const CHECK_INTERVAL_ONLINE = 60_000
const CHECK_INTERVAL_OFFLINE = 15_000

async function checkServerReachability(): Promise<boolean> {
  try {
    isCheckingServer.value = true
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const response = await fetch('/manifest.webmanifest', {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    })
    clearTimeout(timeout)
    return response.ok
  } catch {
    return false
  } finally {
    isCheckingServer.value = false
    lastChecked.value = new Date().toISOString()
  }
}

async function updateConnectivity() {
  const wasReachable = isServerReachable.value
  isOnline.value = navigator.onLine

  if (navigator.onLine) {
    isServerReachable.value = await checkServerReachability()
  } else {
    isServerReachable.value = false
  }

  if (!wasReachable && isServerReachable.value) {
    window.dispatchEvent(new CustomEvent('app:connection-restored'))
  }

  scheduleNextCheck()
}

function scheduleNextCheck() {
  if (checkTimer) clearTimeout(checkTimer)
  const interval = isServerReachable.value ? CHECK_INTERVAL_ONLINE : CHECK_INTERVAL_OFFLINE
  checkTimer = setTimeout(updateConnectivity, interval)
}

function handleOnline() {
  isOnline.value = true
  updateConnectivity()
}

function handleOffline() {
  isOnline.value = false
  isServerReachable.value = false
  lastChecked.value = new Date().toISOString()
  scheduleNextCheck()
}

function startListening() {
  listenerCount++
  if (listenerCount === 1) {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    updateConnectivity()
  }
}

function stopListening() {
  listenerCount--
  if (listenerCount <= 0) {
    listenerCount = 0
    window.removeEventListener('online', handleOnline)
    window.removeEventListener('offline', handleOffline)
    if (checkTimer) {
      clearTimeout(checkTimer)
      checkTimer = null
    }
  }
}

export function useConnectivity() {
  onMounted(startListening)
  onUnmounted(stopListening)

  return {
    isOnline: readonly(isOnline),
    isServerReachable: readonly(isServerReachable),
    isCheckingServer: readonly(isCheckingServer),
    lastChecked: readonly(lastChecked),
    checkNow: updateConnectivity,
  }
}
