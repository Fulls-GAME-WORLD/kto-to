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
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (!doc) {
          throw new Error("Unable to access iframe document")
        }

        const container = doc.body
        const rootRect = container.getBoundingClientRect()

        const blocks: SceneBlock[] = []
        let canvasBg = currentDoc.bg

        const bodyStyle = iframe.contentWindow?.getComputedStyle(container)
        if (bodyStyle) {
          const bodyBg = parseRgbColor(bodyStyle.backgroundColor)
          if (bodyBg && options.replaceCanvas) {
            canvasBg = bodyBg
          }
        }

        const elements = Array.from(container.querySelectorAll<HTMLElement>("*"))

        for (const el of elements) {
          const tag = el.tagName.toLowerCase()
          if (["script", "style", "meta", "link", "noscript", "svg"].includes(tag)) {
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

          if (w <= 0 || h <= 0) {
            continue
          }

          const bg = parseRgbColor(style.backgroundColor)
          const bgImg = extractImageUrl(style.backgroundImage)
          const borderRadius = parseFloat(style.borderRadius) || 0
          const isCircle = borderRadius >= Math.min(w, h) / 2 && Math.abs(w - h) < 6

          if (tag === "img") {
            const imgEl = el as HTMLImageElement
            if (imgEl.src) {
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
                src: imgEl.src,
              })
            }
            continue
          }

          if (bgImg && !bgImg.startsWith("none")) {
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
            })
          } else if (bg && bg !== "transparent") {
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
            })
          }

          const hasDirectText = Array.from(el.childNodes).some(
            (node) => node.nodeType === Node.TEXT_NODE && (node.textContent || "").trim().length > 0
          )
          const isTextContainer =
            ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "a", "button", "label", "b", "strong", "em", "i", "small", "li"].includes(tag) ||
            hasDirectText

          if (isTextContainer && el.children.length === 0) {
            const textContent = (el.textContent || "").trim()
            if (textContent.length > 0) {
              const fontSize = Math.round(parseFloat(style.fontSize) || 16)
              const color = parseRgbColor(style.color) || "#111111"

              blocks.push({
                id: makeId(),
                type: "text",
                x,
                y,
                w: Math.max(40, w),
                h: Math.max(24, h),
                text: textContent,
                fontSize: Math.max(12, fontSize),
                color,
                bg: "transparent",
                src: "",
              })
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
          width: options.resizeCanvasToFit && maxRight > 100 ? Math.max(maxRight + 40, 400) : undefined,
          height: options.resizeCanvasToFit && maxBottom > 100 ? Math.max(maxBottom + 40, 400) : undefined,
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

    const doc = iframe.contentDocument || iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              * { box-sizing: border-box; }
              body { margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
            </style>
          </head>
          <body>
            ${rawHtml}
          </body>
        </html>
      `)
      doc.close()
    } else {
      document.body.removeChild(iframe)
      resolve({ doc: currentDoc, importedCount: 0 })
    }
  })
}
