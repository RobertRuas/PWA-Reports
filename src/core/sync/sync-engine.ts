import { syncQueue } from './queue'
import { appConfig } from '../../app/config/app.config'

export type SyncState = 'idle' | 'syncing' | 'error' | 'disabled'

export interface SyncAdapter {
  send(item: { entityType: string; entityId: string; operation: string; payload: string }): Promise<void>
}

let currentState: SyncState = appConfig.features.sync ? 'idle' : 'disabled'

export function getSyncState(): SyncState {
  return currentState
}

export async function processQueue(adapter: SyncAdapter): Promise<void> {
  if (!appConfig.features.sync) return

  const pending = await syncQueue.getPending()
  if (pending.length === 0) return

  currentState = 'syncing'

  for (const item of pending) {
    try {
      await adapter.send({
        entityType: item.entityType,
        entityId: item.entityId,
        operation: item.operation,
        payload: item.payload,
      })
      if (item.id != null) await syncQueue.markCompleted(item.id)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      if (item.id != null) await syncQueue.markFailed(item.id, message)
      currentState = 'error'
    }
  }

  if (currentState === 'syncing') currentState = 'idle'
}
