import { makeId, type SceneBlock, type SceneDoc } from "./scene.ts"
import { parseRgbColor } from "./color-parser.ts"
import { extractImageUrl } from "./image-url.ts"

export interface ImportOptions {
  replaceCanvas: boolean
  resizeCanvasToFit: boolean
  defaultWidth: number
  defaultHeight: number
}

export interface ImportResult {
  doc: SceneDoc
  width?: number
  height?: number
  importedCount: number
}

export async function convertHtmlToSceneBlocks(
  rawHtml: string,
  options: ImportOptions,
  currentDoc: SceneDoc
): Promise<ImportResult> {
  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.left = "-9999px"
  iframe.style.top = "-9999px"
  iframe.style.width = `${options.defaultWidth || 800}px`
  iframe.style.height = `${options.defaultHeight || 1200}px`
  iframe.style.opacity = "0"
  iframe.style.pointerEvents = "none"
  iframe.style.border = "none"

  document.body.appendChild(iframe)

  return new Promise((resolve) => {
    iframe.onload = () => {
      const win = iframe.contentWindow
      const run = () => {
        try {
          const doc = iframe.contentDocument || win?.document
          if (!doc) {
            throw new Error("Unable to access iframe document")
          }

          const container = doc.body
          const rootRect = container.getBoundingClientRect()
          const blocks: SceneBlock[] = []
          let canvasBg = currentDoc.bg

          if (win) {
            const bodyBg = parseRgbColor(win.getComputedStyle(container).backgroundColor)
            const htmlBg = parseRgbColor(win.getComputedStyle(win.document.documentElement).backgroundColor)
            const detectedBg = bodyBg || htmlBg
            if (detectedBg) {
              canvasBg = detectedBg
            }
          }

        const elements = Array.from(container.querySelectorAll<HTMLElement>("*"))

        for (const el of elements) {
          const tag = el.tagName.toLowerCase()
          if (["script", "style", "meta", "link", "noscript"].includes(tag)) {
            continue
          }

          const style = iframe.contentWindow?.getComputedStyle(el)
          if (!style || style.display === "none" || style.visibility === "hidden" || style.opacity === "0") {
            continue
          }

          const rect = el.getBoundingClientRect()
          const w = Math.round(rect.width)
          const h = Math.round(rect.height)
          const x = Math.round(rect.left - rootRect.left)
          const y = Math.round(rect.top - rootRect.top)

          if (w <= 2 || h <= 2) {
            continue
          }

          const bg = parseRgbColor(style.backgroundColor)
          const bgImg = style.backgroundImage && style.backgroundImage !== "none" ? extractImageUrl(style.backgroundImage) : ""
          const opacity = parseFloat(style.opacity || "1")
          const opacityVal = Number.isFinite(opacity) ? Math.max(0, Math.min(1, opacity)) : 1

          let radius = 0
          const rawRadius = style.borderRadius || ""
          if (rawRadius) {
            if (rawRadius.includes("%")) {
              const pct = parseFloat(rawRadius) || 0
              radius = Math.round(Math.min(w, h) / 2 * (pct / 50))
              if (pct >= 50 && Math.abs(w - h) < 8) {
                radius = 999
              }
            } else {
              radius = Math.round(parseFloat(rawRadius) || 0)
            }
          }
          if (style.borderTopLeftRadius) {
            const tr = parseFloat(style.borderTopLeftRadius) || 0
            if (tr > radius) radius = Math.round(tr)
          }
          radius = Math.max(0, Math.min(radius, Math.min(w, h) / 2))

          const isSvg = tag === "svg"
          if (isSvg) {
            continue
          }

          if (tag === "img") {
            const imgEl = el as HTMLImageElement
            const src = imgEl.currentSrc || imgEl.src || ""
            if (src && !src.startsWith("data:") || src) {
              if (w > 4 && h > 4) {
                blocks.push({
                  id: makeId(),
                  type: "image",
                  x,
                  y,
                  w: Math.max(20, w),
                  h: Math.max(20, h),
                  text: "",
                  fontSize: 16,
                  color: "#000000",
                  bg: "transparent",
                  src,
                  radius: radius > 2 ? radius : 8,
                  opacity: opacityVal,
                })
              }
            }
            continue
          }

          const hasDirectText = Array.from(el.childNodes).some(
            (node) => node.nodeType === Node.TEXT_NODE && (node.textContent || "").trim().length > 0
          )

          if (bgImg && bgImg.length > 4) {
            const isProbablyGradient = bgImg.includes("gradient")
            if (!isProbablyGradient) {
              blocks.push({
                id: makeId(),
                type: "image",
                x,
                y,
                w: Math.max(20, w),
                h: Math.max(20, h),
                text: "",
                fontSize: 16,
                color: "#000000",
                bg: "transparent",
                src: bgImg,
                radius,
                opacity: opacityVal,
              })
              if (hasDirectText) {
                const directText = Array.from(el.childNodes)
                  .filter((n) => n.nodeType === Node.TEXT_NODE)
                  .map((n) => (n.textContent || "").trim())
                  .filter(Boolean)
                  .join(" ")
                if (directText) {
                  const fontSize = Math.round(parseFloat(style.fontSize) || 16)
                  const color = parseRgbColor(style.color) || "#111111"
                  blocks.push({
                    id: makeId(),
                    type: "text",
                    x: Math.max(0, x + 8),
                    y: Math.max(0, y + 8),
                    w: Math.max(40, w - 16),
                    h: Math.max(20, Math.min(h - 16, fontSize * 1.4 + 8)),
                    text: directText.slice(0, 400),
                    fontSize: Math.max(10, Math.min(96, fontSize)),
                    color,
                    bg: "transparent",
                    src: "",
                    radius: 0,
                    opacity: opacityVal,
                  })
                }
              }
              continue
            }
          }

          if (bg && bg !== "transparent") {
            const isCircle = radius >= Math.min(w, h) / 2 - 2 && Math.abs(w - h) < 8
            blocks.push({
              id: makeId(),
              type: isCircle ? "circle" : "rect",
              x,
              y,
              w: Math.max(10, w),
              h: Math.max(10, h),
              text: "",
              fontSize: 16,
              color: "#000000",
              bg,
              src: "",
              radius: isCircle ? 999 : radius,
              opacity: opacityVal,
            })
            if (hasDirectText) {
              const directText = Array.from(el.childNodes)
                .filter((n) => n.nodeType === Node.TEXT_NODE)
                .map((n) => (n.textContent || "").trim())
                .filter(Boolean)
                .join(" ")
              if (directText) {
                const fontSize = Math.round(parseFloat(style.fontSize) || 16)
                const color = parseRgbColor(style.color) || "#111111"
                const hasBg = true
                if (hasBg && directText.length < 300) {
                  blocks.push({
                    id: makeId(),
                    type: "text",
                    x: Math.max(0, x + 8),
                    y: Math.max(0, y + Math.max(8, (h - fontSize * 1.2) / 2)),
                    w: Math.max(40, w - 16),
                    h: Math.max(20, Math.min(h - 16, fontSize * 1.4 + 4)),
                    text: directText.slice(0, 400),
                    fontSize: Math.max(10, Math.min(96, fontSize)),
                    color,
                    bg: "transparent",
                    src: "",
                    radius: 0,
                    opacity: opacityVal,
                  })
                }
              }
            }
            continue
          }

          if (hasDirectText) {
            const directText = Array.from(el.childNodes)
              .filter((n) => n.nodeType === Node.TEXT_NODE)
              .map((n) => (n.textContent || "").trim())
              .filter(Boolean)
              .join(" ")

            if (directText && directText.length > 0) {
              const styleColor = parseRgbColor(style.color) || "#111111"
              const rawSize = parseFloat(style.fontSize) || 16
              const fontSize = Math.round(rawSize)
              const isHeading = ["h1", "h2", "h3", "h4", "h5", "h6"].includes(tag)
              const isButton = tag === "button" || tag === "a"
              const effectiveH = Math.max(18, Math.min(h, fontSize * (isHeading ? 1.25 : 1.4) + 8))
              const effectiveW = Math.max(40, w)

              if (directText.length <= 500) {
                blocks.push({
                  id: makeId(),
                  type: "text",
                  x,
                  y,
                  w: effectiveW,
                  h: effectiveH,
                  text: directText.slice(0, 500),
                  fontSize: Math.max(10, Math.min(isButton ? 18 : 96, fontSize)),
                  color: styleColor,
                  bg: "transparent",
                  src: "",
                  radius: 0,
                  opacity: opacityVal,
                })
              }
            }
          }
        }

        let maxRight = 0
        let maxBottom = 0
        for (const b of blocks) {
          maxRight = Math.max(maxRight, b.x + b.w)
          maxBottom = Math.max(maxBottom, b.y + b.h)
        }

        const newDoc: SceneDoc = {
          v: 1,
          bg: canvasBg,
          blocks: options.replaceCanvas ? blocks : [...currentDoc.blocks, ...blocks],
        }

        document.body.removeChild(iframe)

        resolve({
          doc: newDoc,
          width: options.resizeCanvasToFit && maxRight > 100 ? Math.max(maxRight + 32, 400) : undefined,
          height: options.resizeCanvasToFit && maxBottom > 100 ? Math.max(maxBottom + 32, 400) : undefined,
          importedCount: blocks.length,
        })
      } catch {
        if (iframe.parentNode) {
          document.body.removeChild(iframe)
        }
        resolve({
          doc: currentDoc,
          importedCount: 0,
        })
      }
      }
      if (win) {
        win.requestAnimationFrame(() => win.requestAnimationFrame(() => setTimeout(run, 30)))
      } else {
        setTimeout(run, 30)
      }
    }

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (doc) {
      const trimmed = rawHtml.trim()
      const isFullDoc = /^<!doctype/i.test(trimmed) || /<html[\s>]/i.test(trimmed) || /<head[\s>]/i.test(trimmed) || /<body[\s>]/i.test(trimmed)
      const htmlToWrite = isFullDoc
        ? rawHtml
        : `<!DOCTYPE html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0}img{max-width:100%;height:auto}</style></head><body>${rawHtml}</body></html>`
      doc.open()
      doc.write(htmlToWrite)
      doc.close()
    } else {
      document.body.removeChild(iframe)
      resolve({ doc: currentDoc, importedCount: 0 })
    }
  })
}
