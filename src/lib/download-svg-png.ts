function parseSvgSize(svgText: string): { width: number; height: number } {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml')
  const svg = doc.documentElement
  const width = Number(svg.getAttribute('width')) || 1080
  const height = Number(svg.getAttribute('height')) || 1920
  return { width, height }
}

/** Fetches a same-origin SVG and triggers a PNG download at native pixel size. */
export async function downloadSvgAsPng(
  svgUrl: string,
  filename: string,
): Promise<void> {
  const response = await fetch(svgUrl)
  if (!response.ok) {
    throw new Error(`N\u00e3o foi poss\u00edvel carregar a arte (${response.status})`)
  }

  const svgText = await response.text()
  const { width, height } = parseSvgSize(svgText)
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' })
  const objectUrl = URL.createObjectURL(blob)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Falha ao renderizar a arte'))
      img.src = objectUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Canvas indispon\u00edvel neste navegador')
    }
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, width, height)
    ctx.drawImage(image, 0, 0, width, height)

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) {
            resolve(result)
            return
          }
          reject(new Error('Falha ao gerar PNG'))
        },
        'image/png',
      )
    })

    const downloadUrl = URL.createObjectURL(pngBlob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    link.click()
    URL.revokeObjectURL(downloadUrl)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
