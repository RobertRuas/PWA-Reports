import { z } from 'zod/v4'
import { db, type ExampleRecord } from '../database/db'

const importRecordSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['active', 'archived']),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const importDataSchema = z.object({
  appName: z.string(),
  version: z.string(),
  exportedAt: z.string(),
  records: z.array(importRecordSchema),
})

export interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
}

export async function importData(fileContent: string): Promise<ImportResult> {
  const result: ImportResult = { success: false, imported: 0, skipped: 0, errors: [] }

  let parsed: unknown
  try {
    parsed = JSON.parse(fileContent)
  } catch {
    result.errors.push('O arquivo não contém JSON válido.')
    return result
  }

  const validation = importDataSchema.safeParse(parsed)
  if (!validation.success) {
    result.errors.push('O formato do arquivo não é compatível com esta aplicação.')
    return result
  }

  const data = validation.data

  try {
    await db.transaction('rw', db.exampleRecords, async () => {
      for (const record of data.records) {
        const existing = await db.exampleRecords.get(record.id)
        if (existing) {
          result.skipped++
        } else {
          await db.exampleRecords.add(record as ExampleRecord)
          result.imported++
        }
      }
    })
    result.success = true
  } catch (err) {
    result.errors.push(
      `Falha ao importar dados: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
    )
  }

  return result
}
