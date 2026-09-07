import type { SceneDoc } from "./scene.ts"

function loadStageImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

export async function exportSceneToPng(doc: SceneDoc, width: number, height: number, fileName: string): Promise<void> {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    return
  }

  ctx.fillStyle = doc.bg
  ctx.fillRect(0, 0, width, height)

  for (const block of doc.blocks) {
    if (block.type === "rect") {
      ctx.fillStyle = block.bg
      ctx.fillRect(block.x, block.y, block.w, block.h)
    }
    if (block.type === "circle") {
      ctx.fillStyle = block.bg
      ctx.beginPath()
      ctx.ellipse(block.x + block.w / 2, block.y + block.h / 2, block.w / 2, block.h / 2, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    if (block.type === "text") {
      ctx.fillStyle = block.color
      ctx.font = `${block.fontSize}px sans-serif`
      ctx.textBaseline = "top"
      ctx.fillText(block.text, block.x, block.y + 4, block.w)
    }
    if (block.type === "image" && block.src !== "") {
      const image = await loadStageImage(block.src)
      if (image) {
        ctx.drawImage(image, block.x, block.y, block.w, block.h)
      }
    }
  }

  const link = document.createElement("a")
  link.download = fileName
  link.href = canvas.toDataURL("image/png")
  link.click()
}
