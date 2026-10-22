import { ref } from 'vue'
import { syncQueue } from './queue'
import { getSyncState, type SyncState } from './sync-engine'

const pendingCount = ref(0)
const syncState = ref<SyncState>(getSyncState())

export function useSyncStatus() {
  async function refresh() {
    pendingCount.value = await syncQueue.pendingCount()
    syncState.value = getSyncState()
  }

  return { pendingCount, syncState, refresh }
}
