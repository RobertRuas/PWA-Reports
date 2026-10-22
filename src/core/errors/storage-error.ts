export class StorageError extends Error {
  readonly operation: string
  override readonly cause?: unknown

  constructor(message: string, operation: string, cause?: unknown) {
    super(message)
    this.name = 'StorageError'
    this.operation = operation
    this.cause = cause
  }
}

export function isQuotaExceededError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === 'QuotaExceededError' || error.code === 22
  }
  return false
}

export function handleStorageError(error: unknown, operation: string): StorageError {
  if (isQuotaExceededError(error)) {
    return new StorageError(
      'Espaço de armazenamento insuficiente. Exporte seus dados e libere espaço.',
      operation,
      error,
    )
  }
  const message = error instanceof Error ? error.message : 'Erro desconhecido ao acessar dados'
  return new StorageError(message, operation, error)
}
