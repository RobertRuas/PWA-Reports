import { db, type ExampleRecord } from '../db'

function generateId(): string {
  return globalThis.crypto.randomUUID()
}

function now(): string {
  return new Date().toISOString()
}

export const exampleRecordRepository = {
  async getAll(): Promise<ExampleRecord[]> {
    return db.exampleRecords.orderBy('createdAt').reverse().toArray()
  },

  async getById(id: string): Promise<ExampleRecord | undefined> {
    return db.exampleRecords.get(id)
  },

  async getByStatus(status: ExampleRecord['status']): Promise<ExampleRecord[]> {
    return db.exampleRecords.where('status').equals(status).toArray()
  },

  async create(data: Pick<ExampleRecord, 'title' | 'description'>): Promise<ExampleRecord> {
    const record: ExampleRecord = {
      id: generateId(),
      title: data.title,
      description: data.description,
      status: 'active',
      createdAt: now(),
      updatedAt: now(),
    }
    await db.exampleRecords.add(record)
    return record
  },

  async update(
    id: string,
    data: Partial<Pick<ExampleRecord, 'title' | 'description' | 'status'>>,
  ): Promise<void> {
    await db.exampleRecords.update(id, {
      ...data,
      updatedAt: now(),
    })
  },

  async remove(id: string): Promise<void> {
    await db.exampleRecords.delete(id)
  },

  async count(): Promise<number> {
    return db.exampleRecords.count()
  },

  async clear(): Promise<void> {
    await db.exampleRecords.clear()
  },
}
