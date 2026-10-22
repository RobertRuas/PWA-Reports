export const appConfig = {
  name: 'PWA Starter Kit',
  shortName: 'StarterKit',
  description: 'Base reutilizável para aplicações mobile-first, instaláveis e com dados locais',
  theme: {
    primary: '#24527A',
    accent: '#26736B',
  },
  features: {
    localDatabase: true,
    dataExport: true,
    attachments: false,
    audioRecording: false,
    sync: false,
    authentication: false,
  },
} as const

export type AppConfig = typeof appConfig
