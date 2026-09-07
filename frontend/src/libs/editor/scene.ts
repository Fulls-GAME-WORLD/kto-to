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
      blocks: doc.blocks.filter((b) => b && typeof b.id === "string"),
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
  const base = { id: makeId(), x: 60, y: 60, w: 300, h: 120, text: "", fontSize: 48, color: "#111111", bg: "#ffdd00", src: "" }
  if (type === "text") {
    return { ...base, type, text: "New text", h: 80 }
  }
  if (type === "image") {
    return { ...base, type, w: 300, h: 300 }
  }
  if (type === "circle") {
    return { ...base, type, w: 200, h: 200 }
  }
  return { ...base, type }
}
