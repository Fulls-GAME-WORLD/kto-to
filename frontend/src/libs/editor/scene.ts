export type BlockType = "text" | "rect" | "circle" | "image"

export interface SceneBlock {
  id: string
  type: BlockType
  x: number
  y: number
  w: number
  h: number
  text: string
  fontSize: number
  color: string
  bg: string
  src: string
  bgImg?: string
  radius: number
  opacity: number
}

export interface SceneDoc {
  v: 1
  bg: string
  blocks: SceneBlock[]
}

export function emptyScene(bg = "#ffffff"): SceneDoc {
  return { v: 1, bg, blocks: [] }
}

export function parseScene(raw: string): SceneDoc {
  try {
    const doc = JSON.parse(raw) as Partial<SceneDoc>
    if (!doc || !Array.isArray(doc.blocks)) {
      return emptyScene(typeof doc?.bg === "string" ? doc.bg : "#ffffff")
    }
    return {
      v: 1,
      bg: typeof doc.bg === "string" ? doc.bg : "#ffffff",
      blocks: doc.blocks
        .filter((b) => b && typeof b.id === "string")
        .map((b) => ({
          id: b.id,
          type: (b.type as BlockType) || "rect",
          x: typeof b.x === "number" ? b.x : 60,
          y: typeof b.y === "number" ? b.y : 60,
          w: typeof b.w === "number" ? b.w : 120,
          h: typeof b.h === "number" ? b.h : 80,
          text: typeof b.text === "string" ? b.text : "",
          fontSize: typeof b.fontSize === "number" ? b.fontSize : 16,
          color: typeof b.color === "string" ? b.color : "#111111",
          bg: typeof b.bg === "string" ? b.bg : "#ffdd00",
          src: typeof b.src === "string" ? b.src : "",
          bgImg: typeof (b as SceneBlock).bgImg === "string" ? (b as SceneBlock).bgImg : "",
          radius: typeof (b as SceneBlock).radius === "number" ? (b as SceneBlock).radius : 0,
          opacity: typeof (b as SceneBlock).opacity === "number" ? (b as SceneBlock).opacity : 1,
        })),
    }
  } catch {
    return emptyScene()
  }
}

export function serializeScene(doc: SceneDoc): string {
  return JSON.stringify(doc)
}

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

export function makeBlock(type: BlockType): SceneBlock {
  const base = { id: makeId(), x: 60, y: 60, w: 300, h: 120, text: "", fontSize: 48, color: "#111111", bg: "#ffdd00", src: "", bgImg: "", radius: 0, opacity: 1 }
  if (type === "text") {
    return { ...base, type, text: "New text", h: 80, radius: 8 }
  }
  if (type === "image") {
    return { ...base, type, w: 300, h: 300, radius: 12 }
  }
  if (type === "circle") {
    return { ...base, type, w: 200, h: 200, radius: 999 }
  }
  return { ...base, type, radius: 12 }
}
