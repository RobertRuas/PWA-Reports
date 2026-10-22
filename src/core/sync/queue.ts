import { db, type SyncQueueItem } from '../database/db'

export const syncQueue = {
  async add(item: Omit<SyncQueueItem, 'id' | 'attemptCount' | 'nextAttemptAt' | 'status' | 'lastError'>): Promise<void> {
    await db.syncQueue.add({
      ...item,
      attemptCount: 0,
      nextAttemptAt: null,
      status: 'pending',
      lastError: null,
    })
  },

  async getPending(): Promise<SyncQueueItem[]> {
    return db.syncQueue.where('status').equals('pending').toArray()
  },

  async markCompleted(id: number): Promise<void> {
    await db.syncQueue.update(id, { status: 'completed' })
  },

  async markFailed(id: number, error: string): Promise<void> {
    const item = await db.syncQueue.get(id)
    if (!item) return

    const attemptCount = item.attemptCount + 1
    const backoffMs = Math.min(1000 * Math.pow(2, attemptCount), 300_000)
    const nextAttemptAt = new Date(Date.now() + backoffMs).toISOString()

    await db.syncQueue.update(id, {
      attemptCount,
      nextAttemptAt,
      status: attemptCount >= 10 ? 'failed' : 'pending',
      lastError: error.slice(0, 500),
    })
  },

  async pendingCount(): Promise<number> {
    return db.syncQueue.where('status').equals('pending').count()
  },

  async clear(): Promise<void> {
    await db.syncQueue.clear()
  },
}
