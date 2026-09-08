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

export function convertHtmlToSceneBlocks(
  rawHtml: string,
  options: ImportOptions,
  currentDoc: SceneDoc
): Promise<ImportResult> {
  const trimmed = rawHtml.trim()
  const isFullDoc =
    /^<!doctype/i.test(trimmed) ||
    /<html[\s>]/i.test(trimmed) ||
    /<head[\s>]/i.test(trimmed) ||
    /<body[\s>]/i.test(trimmed)

  const htmlToWrite = isFullDoc
    ? rawHtml
    : `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${rawHtml}</body></html>`

  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.left = "-9999px"
  iframe.style.top = "-9999px"
  iframe.style.width = `${options.defaultWidth || 800}px`
  iframe.style.height = `${options.defaultHeight || 1200}px`
  iframe.style.opacity = "0"
  iframe.style.pointerEvents = "none"
  iframe.style.border = "none"
  iframe.setAttribute("aria-hidden", "true")
  iframe.tabIndex = -1

  return new Promise((resolve) => {
    let settled = false

    function cleanup() {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
      }
    }

    function finish(result: ImportResult) {
      if (settled) {
        return
      }
      settled = true
      cleanup()
      resolve(result)
    }

    function measure() {
      try {
        const win = iframe.contentWindow
        const doc = iframe.contentDocument || win?.document
        if (!doc || !win) {
          throw new Error("no iframe doc")
        }

        const container = doc.body
        if (!container) {
          throw new Error("no body")
        }
        const rootRect = container.getBoundingClientRect()
        const blocks: SceneBlock[] = []
        let canvasBg = currentDoc.bg

        const bodyBg = parseRgbColor(win.getComputedStyle(container).backgroundColor)
        const htmlBg = parseRgbColor(win.getComputedStyle(win.document.documentElement).backgroundColor)
        let detectedBg = bodyBg || htmlBg

        if (!detectedBg) {
          const vw = win.innerWidth || options.defaultWidth || 800
          const vh = win.innerHeight || options.defaultHeight || 1200
          let bestBg = ""
          let bestArea = 0
          let bestEl: HTMLElement | null = null
          let bestGradient = ""
          const candidates = Array.from(container.querySelectorAll<HTMLElement>("*"))
          for (const cand of candidates) {
            const tag = cand.tagName.toLowerCase()
            if (tag === "script" || tag === "style" || tag === "meta" || tag === "link" || tag === "noscript" || tag === "svg" || tag === "canvas" || tag === "img") {
              continue
            }
            const r = cand.getBoundingClientRect()
            if (r.width >= vw * 0.7 && r.height >= vh * 0.6) {
              const cs = win.getComputedStyle(cand)
              const solid = parseRgbColor(cs.backgroundColor)
              if (solid && solid !== "transparent") {
                const area = r.width * r.height
                if (area > bestArea) {
                  bestArea = area
                  bestBg = solid
                  bestEl = cand
                }
              } else if (!bestBg && cs.backgroundImage && cs.backgroundImage.includes("gradient")) {
                const m = cs.backgroundImage.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})/)
                if (m) {
                  const g = parseRgbColor(m[1])
                  if (g) {
                    bestGradient = g
                  }
                }
              }
            }
          }
          if (bestBg && bestEl) {
            detectedBg = bestBg
            ;(bestEl as HTMLElement).dataset.figmaBg = "1"
          } else if (bestGradient) {
            detectedBg = bestGradient
          }
        }

        if (detectedBg) {
          canvasBg = detectedBg
        }

        window.console.info("[html-import]", {
          bodyBg,
          htmlBg,
          canvasBg,
          blocks: blocks.length,
        })

        const elements = Array.from(container.querySelectorAll<HTMLElement>("*"))

        for (const el of elements) {
          const tag = el.tagName.toLowerCase()
          if (tag === "script" || tag === "style" || tag === "meta" || tag === "link" || tag === "noscript" || tag === "svg" || tag === "canvas") {
            continue
          }
          if ((el as HTMLElement).dataset.figmaBg === "1") {
            continue
          }

          const style = win.getComputedStyle(el)
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
          const opacityRaw = parseFloat(style.opacity || "1")
          const opacityVal = Number.isFinite(opacityRaw) ? Math.max(0, Math.min(1, opacityRaw)) : 1

          let radius = 0
          const rawRadius = style.borderRadius || ""
          if (rawRadius) {
            if (rawRadius.includes("%")) {
              const pct = parseFloat(rawRadius) || 0
              radius = Math.round((Math.min(w, h) / 2) * (pct / 50))
              if (pct >= 50 && Math.abs(w - h) < 8) {
                radius = 999
              }
            } else {
              radius = Math.round(parseFloat(rawRadius) || 0)
            }
          }
          const tl = parseFloat(style.borderTopLeftRadius) || 0
          if (tl > radius) {
            radius = Math.round(tl)
          }
          radius = Math.max(0, Math.min(radius, Math.min(w, h) / 2))

          if (tag === "img") {
            const imgEl = el as HTMLImageElement
            const src = imgEl.currentSrc || imgEl.src || ""
            if (src && w > 4 && h > 4) {
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
            continue
          }

          const directText = Array.from(el.childNodes)
            .filter((n) => n.nodeType === Node.TEXT_NODE)
            .map((n) => (n.textContent || "").trim())
            .filter(Boolean)
            .join(" ")
          const hasDirectText = directText.length > 0

          if (bgImg && bgImg.length > 4 && !bgImg.includes("gradient")) {
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
            continue
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
            if (hasDirectText && directText.length < 300) {
              const fontSize = Math.round(parseFloat(style.fontSize) || 16)
              const color = parseRgbColor(style.color) || "#111111"
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
            continue
          }

          if (hasDirectText && directText.length <= 500) {
            const styleColor = parseRgbColor(style.color) || "#111111"
            const fontSize = Math.round(parseFloat(style.fontSize) || 16)
            const isHeading = tag === "h1" || tag === "h2" || tag === "h3" || tag === "h4" || tag === "h5" || tag === "h6"
            const isButton = tag === "button" || tag === "a"
            blocks.push({
              id: makeId(),
              type: "text",
              x,
              y,
              w: Math.max(40, w),
              h: Math.max(18, Math.min(h, fontSize * (isHeading ? 1.25 : 1.4) + 8)),
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

        let maxRight = 0
        let maxBottom = 0
        for (const b of blocks) {
          maxRight = Math.max(maxRight, b.x + b.w)
          maxBottom = Math.max(maxBottom, b.y + b.h)
        }

        finish({
          doc: {
            v: 1,
            bg: canvasBg,
            blocks: options.replaceCanvas ? blocks : [...currentDoc.blocks, ...blocks],
          },
          width: options.resizeCanvasToFit && maxRight > 100 ? Math.max(maxRight + 32, 400) : undefined,
          height: options.resizeCanvasToFit && maxBottom > 100 ? Math.max(maxBottom + 32, 400) : undefined,
          importedCount: blocks.length,
        })
      } catch {
        finish({ doc: currentDoc, importedCount: 0 })
      }
    }

    iframe.onload = () => {
      const win = iframe.contentWindow
      const afterFonts = () => {
        if (win) {
          win.requestAnimationFrame(() => {
            win.requestAnimationFrame(() => {
              window.setTimeout(measure, 400)
            })
          })
        } else {
          window.setTimeout(measure, 400)
        }
      }
      try {
        const fonts = (win?.document as Document | undefined)?.fonts
        if (fonts && typeof fonts.ready?.then === "function") {
          let done = false
          fonts.ready.then(() => {
            if (!done) {
              done = true
              afterFonts()
            }
          }).catch(() => {
            if (!done) {
              done = true
              afterFonts()
            }
          })
          window.setTimeout(() => {
            if (!done) {
              done = true
              afterFonts()
            }
          }, 1500)
        } else {
          afterFonts()
        }
      } catch {
        afterFonts()
      }
    }

    document.body.appendChild(iframe)
    iframe.srcdoc = htmlToWrite
    window.setTimeout(() => {
      if (!settled) {
        measure()
      }
    }, 4000)
  })
}
