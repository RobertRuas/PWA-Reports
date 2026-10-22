import Dexie from 'dexie'
import type { Table } from 'dexie'

export interface ExampleRecord {
  id?: string
  title: string
  description: string
  status: 'active' | 'archived'
  createdAt: string
  updatedAt: string
}

export interface SyncQueueItem {
  id?: number
  entityType: string
  entityId: string
  operation: 'create' | 'update' | 'delete'
  payload: string
  createdAt: string
  attemptCount: number
  nextAttemptAt: string | null
  status: 'pending' | 'sending' | 'completed' | 'failed'
  lastError: string | null
}

export class AppDatabase extends Dexie {
  exampleRecords!: Table<ExampleRecord, string>
  syncQueue!: Table<SyncQueueItem, number>

  constructor() {
    super('pwa-starter-kit')
    this.version(1).stores({
      exampleRecords: 'id, status, createdAt, updatedAt',
      syncQueue: '++id, entityType, entityId, status, nextAttemptAt',
    })
  }
}

export const db = new AppDatabase()
