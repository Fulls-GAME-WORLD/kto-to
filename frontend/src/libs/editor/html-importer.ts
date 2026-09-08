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

  window.console.info("[html-import] input", {
    rawLen: rawHtml.length,
    isFullDoc,
    outLen: htmlToWrite.length,
    hasStyleTag: /<style[\s>]/i.test(rawHtml),
    hasLinkTag: /<link[\s>]/i.test(rawHtml),
    hasBodyCss: /body\s*\{[^}]*background/i.test(rawHtml),
  })

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

        const bodyCs = win.getComputedStyle(container)
        const htmlCs = win.getComputedStyle(win.document.documentElement)
        window.console.info("[html-import] computed bg", {
          bodyBgRaw: bodyCs.backgroundColor,
          bodyBgImgRaw: String(bodyCs.backgroundImage).slice(0, 120),
          htmlBgRaw: htmlCs.backgroundColor,
          htmlBgImgRaw: String(htmlCs.backgroundImage).slice(0, 120),
          innerW: win.innerWidth,
          innerH: win.innerHeight,
          rootRect: `${Math.round(rootRect.width)}x${Math.round(rootRect.height)} @${Math.round(rootRect.left)},${Math.round(rootRect.top)}`,
          totalElements: container.querySelectorAll("*").length,
        })
        const bodyBg = parseRgbColor(bodyCs.backgroundColor)
        const htmlBg = parseRgbColor(htmlCs.backgroundColor)
        let detectedBg = bodyBg || htmlBg

        if (!detectedBg) {
          const bodyImg = bodyCs.backgroundImage || ""
          const htmlImg = htmlCs.backgroundImage || ""
          const gradSrc = bodyImg.includes("gradient") ? bodyImg : htmlImg.includes("gradient") ? htmlImg : ""
          if (gradSrc) {
            const gm = gradSrc.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})/)
            if (gm) {
              detectedBg = parseRgbColor(gm[1])
            }
          }
        }

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
          window.console.info("[html-import] fullscreen fallback", {
            checked: candidates.length,
            bestBg,
            bestArea: Math.round(bestArea),
            bestEl: bestEl ? `${bestEl.tagName.toLowerCase()}.${String((bestEl as HTMLElement).className).slice(0, 60)}` : null,
            bestGradient,
          })
        }

        if (detectedBg) {
          canvasBg = detectedBg
        }

        const byType: Record<string, number> = {}
        for (const b of blocks) {
          byType[b.type] = (byType[b.type] || 0) + 1
        }
        window.console.info("[html-import] result", {
          bodyBg,
          htmlBg,
          canvasBg,
          currentBg: currentDoc.bg,
          replaceCanvas: options.replaceCanvas,
          blocks: blocks.length,
          byType,
          textColors: blocks.filter((b) => b.type === "text").slice(0, 8).map((b) => b.color),
          blockBgs: blocks.filter((b) => b.type === "rect" || b.type === "circle").slice(0, 8).map((b) => b.bg),
        })

        const elements = Array.from(container.querySelectorAll<HTMLElement>("*"))

        for (const el of elements) {
          const tag = el.tagName.toLowerCase()
          if (tag === "script" || tag === "style" || tag === "meta" || tag === "link" || tag === "noscript") {
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

          let bg = parseRgbColor(style.backgroundColor)
          if ((!bg || bg === "transparent") && style.backgroundImage && style.backgroundImage.includes("gradient")) {
            const gm = style.backgroundImage.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8})/)
            if (gm) {
              const g = parseRgbColor(gm[1])
              if (g) {
                bg = g
              }
            }
          }
          const rawBgImg = style.backgroundImage && style.backgroundImage !== "none" ? style.backgroundImage : ""
          const isBgGradient = rawBgImg.includes("gradient")
          const gradCss = isBgGradient ? rawBgImg : ""
          const bgImg = !isBgGradient ? extractImageUrl(rawBgImg) : ""
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

          if (tag === "canvas") {
            const vw = win.innerWidth || options.defaultWidth || 800
            const vh = win.innerHeight || options.defaultHeight || 1200
            if (w > 4 && h > 4 && (w < vw * 0.7 || h < vh * 0.6)) {
              try {
                const url = (el as unknown as HTMLCanvasElement).toDataURL("image/png")
                if (url && url.length > 200) {
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
                    src: url,
                    radius,
                    opacity: opacityVal,
                  })
                }
              } catch {
                window.console.warn("[html-import] tainted canvas skipped")
              }
            }
            continue
          }
          if (tag === "svg") {
            if (w > 4 && h > 4) {
              try {
                const clone = el.cloneNode(true) as unknown as SVGSVGElement
                clone.setAttribute("xmlns", "http://www.w3.org/2000/svg")
                clone.setAttribute("width", String(Math.max(1, Math.round(w))))
                clone.setAttribute("height", String(Math.max(1, Math.round(h))))
                const svgText = new XMLSerializer().serializeToString(clone)
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
                  src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgText)}`,
                  radius,
                  opacity: opacityVal,
                })
              } catch {
                window.console.warn("[html-import] bad svg skipped")
              }
            }
            continue
          }
          const svgHost = el as unknown as Element
          if (typeof svgHost.closest === "function" && svgHost.closest("svg")) {
            continue
          }

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

          if (bgImg && bgImg.length > 4) {
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
              bgImg: gradCss,
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
      } catch (e) {
        window.console.error("[html-import] measure failed", e)
        finish({ doc: currentDoc, importedCount: 0 })
      }
    }

    iframe.onload = () => {
      const win = iframe.contentWindow
      try {
        const d = iframe.contentDocument || win?.document
        const sheets = d ? Array.from(d.styleSheets) : []
        window.console.info("[html-import] iframe loaded", {
          title: d?.title,
          bodyChildren: d?.body?.childElementCount,
          styleTags: d?.querySelectorAll("style").length,
          linkTags: d?.querySelectorAll('link[rel="stylesheet"]').length,
          styleSheets: sheets.length,
          sheetHrefs: sheets.map((s) => {
            try {
              return (s as CSSStyleSheet).href || "(inline)"
            } catch {
              return "(blocked)"
            }
          }),
          bodyHtmlLen: d?.body?.innerHTML.length,
        })
      } catch (e) {
        window.console.warn("[html-import] iframe inspect failed", e)
      }
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
        window.console.warn("[html-import] onload never fired, measuring anyway")
        measure()
      }
    }, 4000)
  })
}
