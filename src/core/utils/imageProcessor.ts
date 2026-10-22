/**
 * Utilitário para processamento de imagens.
 * Converte imagens para JPEG 1050p com 80% de qualidade.
 */

const MAX_DIMENSION = 1050
const JPEG_QUALITY = 0.8

/**
 * Converte uma imagem File/Blob para JPEG com dimensão máxima de 1050px e 80% qualidade.
 */
export async function processImage(file: File | Blob): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)

      // Calcular dimensões mantendo proporção
      let { width, height } = img
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height / width) * MAX_DIMENSION)
          width = MAX_DIMENSION
        } else {
          width = Math.round((width / height) * MAX_DIMENSION)
          height = MAX_DIMENSION
        }
      }

      // Desenhar no canvas
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Falha ao criar contexto do canvas'))
        return
      }
      ctx.drawImage(img, 0, 0, width, height)

      // Converter para JPEG blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Falha ao converter imagem para JPEG'))
          }
        },
        'image/jpeg',
        JPEG_QUALITY,
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Falha ao carregar imagem'))
    }

    img.src = url
  })
}

/**
 * Gera o nome do ficheiro seguindo o padrão: {nome_do_projeto}_{pasta}_{ordem}.jpeg
 * Remove espaços e caracteres especiais do nome do projeto.
 */
export function generatePhotoFilename(
  projectName: string,
  folder: string,
  order: number,
): string {
  // Sanitizar nome do projeto (remover espaços, acentos, caracteres especiais)
  const sanitized = projectName
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // Remover acentos
    .replace(/[^a-zA-Z0-9]/g, '') // Só alfanuméricos

  return `${sanitized}_${folder}_${order}.jpeg`
}
