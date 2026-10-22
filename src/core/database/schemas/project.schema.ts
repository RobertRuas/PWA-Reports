import { z } from 'zod'

export const ProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Nome é obrigatório'),
  mapId: z.string(), // T1, T10, T24, C12, etc
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Project = z.infer<typeof ProjectSchema>

export const PhotoSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  folder: z.string(), // Inbox, General, Trash, T1, T10, etc
  filename: z.string(),
  data: z.instanceof(Blob),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})

export type Photo = z.infer<typeof PhotoSchema>

// Map definitions - same as FastReport
export const MAPS = {
  'inspection-t24': {
    id: 'inspection-t24',
    name: 'Inspeção T1–T24',
    folders: ['Inbox', 'General', 'Trash', 'T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12', 'T13', 'T14', 'T15', 'T16', 'T17', 'T18', 'T19', 'T20', 'T21', 'T22', 'T23', 'T24'],
  },
  'tendons-retrofit': {
    id: 'tendons-retrofit',
    name: 'Retrofit de Tendões',
    folders: ['Inbox', 'General', 'Trash', 'C12', 'C25', 'T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09'],
  },
} as const

export type MapId = keyof typeof MAPS
