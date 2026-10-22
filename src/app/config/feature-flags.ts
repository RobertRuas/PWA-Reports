import { appConfig } from './app.config'

export function isFeatureEnabled(feature: keyof typeof appConfig.features): boolean {
  return appConfig.features[feature]
}
