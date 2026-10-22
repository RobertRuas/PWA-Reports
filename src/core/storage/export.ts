import { db } from '../database/db'
import { appConfig } from '../../app/config/app.config'

export interface ExportData {
  appName: string
  version: string
  exportedAt: string
  records: unknown[]
}

export async function exportAllData(): Promise<ExportData> {
  const records = await db.exampleRecords.toArray()

  return {
    appName: appConfig.name,
    version: '1',
    exportedAt: new Date().toISOString(),
    records,
  }
}

export function downloadAsJson(data: ExportData, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
