import type { SceneBlock, SceneDoc } from "./scene.ts"

function loadStageImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = src
  })
}

interface ParsedGradientStop {
  color: string
  pos: number
}

function splitGradientParts(inner: string): string[] {
  const parts: string[] = []
  let depth = 0
  let cur = ""
  for (const ch of inner) {
    if (ch === "(") {
      depth += 1
    } else if (ch === ")") {
      depth = Math.max(0, depth - 1)
    }
    if (ch === "," && depth === 0) {
      parts.push(cur.trim())
      cur = ""
    } else {
      cur += ch
    }
  }
  if (cur.trim() !== "") {
    parts.push(cur.trim())
  }
  return parts
}

function gradientAngleToDeg(token: string): number | null {
  const t = token.trim().toLowerCase()
  const deg = t.match(/^(-?[\d.]+)deg$/)
  if (deg) {
    return Number(deg[1])
  }
  if (t.startsWith("to ")) {
    let dx = 0
    let dy = 0
    for (const d of t.slice(3).trim().split(/\s+/)) {
      if (d === "right") {
        dx += 1
      } else if (d === "left") {
        dx -= 1
      } else if (d === "bottom") {
        dy += 1
      } else if (d === "top") {
        dy -= 1
      }
    }
    if (dx === 0 && dy === 0) {
      return null
    }
    return (Math.atan2(dx, -dy) * 180) / Math.PI
  }
  return null
}

function parseLinearGradient(bgImg: string): { angle: number; stops: ParsedGradientStop[] } | null {
  const key = "linear-gradient("
  const idx = bgImg.indexOf(key)
  if (idx < 0) {
    return null
  }
  const inner = bgImg.slice(idx + key.length, bgImg.lastIndexOf(")"))
  const parts = splitGradientParts(inner)
  if (parts.length < 2) {
    return null
  }
  let angle = 180
  let rest = parts
  const maybeAngle = gradientAngleToDeg(parts[0])
  if (maybeAngle !== null) {
    angle = maybeAngle
    rest = parts.slice(1)
  }
  const stops: ParsedGradientStop[] = []
  rest.forEach((part, i) => {
    const m = part.match(/^(.*?)\s+(-?[\d.]+%|-?[\d.]+px)$/)
    if (m) {
      const fallback = rest.length > 1 ? i / (rest.length - 1) : 0
      const pos = m[2].endsWith("%") ? Number(m[2].slice(0, -1)) / 100 : fallback
      stops.push({ color: m[1].trim(), pos: Math.max(0, Math.min(1, pos)) })
    } else {
      stops.push({ color: part, pos: rest.length > 1 ? i / (rest.length - 1) : 0 })
    }
  })
  if (stops.length === 0) {
    return null
  }
  return { angle, stops }
}

function blockFillStyle(ctx: CanvasRenderingContext2D, block: SceneBlock): string | CanvasGradient {
  if (block.bgImg && block.bgImg.includes("linear-gradient")) {
    const parsed = parseLinearGradient(block.bgImg)
    if (parsed && parsed.stops.length > 0) {
      const rad = (parsed.angle * Math.PI) / 180
      const dx = Math.sin(rad)
      const dy = -Math.cos(rad)
      const len = Math.abs(block.w * dx) + Math.abs(block.h * dy)
      const cx = block.x + block.w / 2
      const cy = block.y + block.h / 2
      const grad = ctx.createLinearGradient(cx - (dx * len) / 2, cy - (dy * len) / 2, cx + (dx * len) / 2, cy + (dy * len) / 2)
      for (const s of parsed.stops) {
        grad.addColorStop(Math.max(0, Math.min(1, s.pos)), s.color)
      }
      return grad
    }
  }
  return block.bg
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
      ctx.fillStyle = blockFillStyle(ctx, block)
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
      ctx.fillStyle = blockFillStyle(ctx, block)
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
