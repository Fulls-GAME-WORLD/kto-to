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
    const opacity = typeof (block as unknown as { opacity?: number }).opacity === "number" ? (block as unknown as { opacity: number }).opacity : 1
    const radius = typeof (block as unknown as { radius?: number }).radius === "number" ? (block as unknown as { radius: number }).radius : 0
    ctx.save()
    ctx.globalAlpha = Math.max(0, Math.min(1, opacity))
    if (block.type === "rect") {
      ctx.fillStyle = block.bg
      const r = Math.max(0, Math.min(radius, block.w / 2, block.h / 2))
      if (r > 0) {
        if (typeof (ctx as unknown as { roundRect?: unknown }).roundRect === "function") {
          ctx.beginPath()
          ;(ctx as unknown as { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void }).roundRect(block.x, block.y, block.w, block.h, r)
          ctx.fill()
        } else {
          ctx.beginPath()
          ctx.moveTo(block.x + r, block.y)
          ctx.lineTo(block.x + block.w - r, block.y)
          ctx.quadraticCurveTo(block.x + block.w, block.y, block.x + block.w, block.y + r)
          ctx.lineTo(block.x + block.w, block.y + block.h - r)
          ctx.quadraticCurveTo(block.x + block.w, block.y + block.h, block.x + block.w - r, block.y + block.h)
          ctx.lineTo(block.x + r, block.y + block.h)
          ctx.quadraticCurveTo(block.x, block.y + block.h, block.x, block.y + block.h - r)
          ctx.lineTo(block.x, block.y + r)
          ctx.quadraticCurveTo(block.x, block.y, block.x + r, block.y)
          ctx.closePath()
          ctx.fill()
        }
      } else {
        ctx.fillRect(block.x, block.y, block.w, block.h)
      }
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
        const r = Math.max(0, Math.min(radius, block.w / 2, block.h / 2))
        if (r > 0) {
          ctx.beginPath()
          if (typeof (ctx as unknown as { roundRect?: unknown }).roundRect === "function") {
            ;(ctx as unknown as { roundRect: (x:number,y:number,w:number,h:number,r:number)=>void }).roundRect(block.x, block.y, block.w, block.h, r)
          } else {
            ctx.moveTo(block.x + r, block.y)
            ctx.lineTo(block.x + block.w - r, block.y)
            ctx.quadraticCurveTo(block.x + block.w, block.y, block.x + block.w, block.y + r)
            ctx.lineTo(block.x + block.w, block.y + block.h - r)
            ctx.quadraticCurveTo(block.x + block.w, block.y + block.h, block.x + block.w - r, block.y + block.h)
            ctx.lineTo(block.x + r, block.y + block.h)
            ctx.quadraticCurveTo(block.x, block.y + block.h, block.x, block.y + block.h - r)
            ctx.lineTo(block.x, block.y + r)
            ctx.quadraticCurveTo(block.x, block.y, block.x + r, block.y)
            ctx.closePath()
          }
          ctx.clip()
        }
        ctx.drawImage(image, block.x, block.y, block.w, block.h)
      }
    }
    ctx.restore()
  }

  const link = document.createElement("a")
  link.download = fileName
  link.href = canvas.toDataURL("image/png")
  link.click()
}
