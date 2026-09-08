import { useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import type { SceneBlock, SceneDoc } from "../../../../libs/editor/scene.ts"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface PosterStageProps {
  stageDoc: SceneDoc
  stageWidth: number
  stageHeight: number
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  onMoveBlock: (id: string, x: number, y: number) => void
  onResizeBlock?: (id: string, x: number, y: number, w: number, h: number) => void
  onRadiusChange?: (id: string, radius: number) => void
}

function PosterStage({ stageDoc, stageWidth, stageHeight, selectedBlockId, onSelectBlock, onMoveBlock, onResizeBlock, onRadiusChange }: PosterStageProps) {
  const dragState = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)
  const resizeState = useRef<{ id: string; handle: string; startX: number; startY: number; origX: number; origY: number; origW: number; origH: number } | null>(null)
  const radiusState = useRef<{ id: string; startX: number; origRadius: number; maxRadius: number } | null>(null)

  function beginBlockDrag(event: ReactPointerEvent, block: SceneBlock) {
    event.stopPropagation()
    onSelectBlock(block.id)
    dragState.current = {
      id: block.id,
      startX: event.clientX,
      startY: event.clientY,
      origX: block.x,
      origY: block.y,
    }
    const target = event.currentTarget as HTMLElement
    target.setPointerCapture(event.pointerId)
  }

  function moveBlockDrag(event: ReactPointerEvent) {
    const current = dragState.current
    if (!current) {
      return
    }
    onMoveBlock(current.id, current.origX + (event.clientX - current.startX), current.origY + (event.clientY - current.startY))
  }

  function endBlockDrag() {
    dragState.current = null
  }

  function beginResize(event: ReactPointerEvent, block: SceneBlock, handle: string) {
    event.stopPropagation()
    onSelectBlock(block.id)
    resizeState.current = {
      id: block.id,
      handle,
      startX: event.clientX,
      startY: event.clientY,
      origX: block.x,
      origY: block.y,
      origW: block.w,
      origH: block.h,
    }
    const target = event.currentTarget as HTMLElement
    target.setPointerCapture(event.pointerId)
  }

  function moveResize(event: ReactPointerEvent) {
    const s = resizeState.current
    if (!s || !onResizeBlock) return
    const dx = event.clientX - s.startX
    const dy = event.clientY - s.startY
    let nx = s.origX
    let ny = s.origY
    let nw = s.origW
    let nh = s.origH
    const min = 20

    if (s.handle.includes("e")) nw = Math.max(min, s.origW + dx)
    if (s.handle.includes("w")) {
      nw = Math.max(min, s.origW - dx)
      nx = s.origX + dx
      if (nw === min) nx = s.origX + s.origW - min
    }
    if (s.handle.includes("s")) nh = Math.max(min, s.origH + dy)
    if (s.handle.includes("n")) {
      nh = Math.max(min, s.origH - dy)
      ny = s.origY + dy
      if (nh === min) ny = s.origY + s.origH - min
    }

    onResizeBlock(s.id, nx, ny, nw, nh)
  }

  function endResize() {
    resizeState.current = null
  }

  function beginRadius(event: ReactPointerEvent, block: SceneBlock) {
    event.stopPropagation()
    onSelectBlock(block.id)
    radiusState.current = {
      id: block.id,
      startX: event.clientX,
      origRadius: block.radius || 0,
      maxRadius: Math.min(block.w, block.h) / 2,
    }
    const target = event.currentTarget as HTMLElement
    target.setPointerCapture(event.pointerId)
  }

  function moveRadius(event: ReactPointerEvent) {
    const s = radiusState.current
    if (!s || !onRadiusChange) return
    const dx = event.clientX - s.startX
    const next = Math.max(0, Math.min(s.maxRadius, s.origRadius + dx * 0.6))
    onRadiusChange(s.id, Math.round(next))
  }

  function endRadius() {
    radiusState.current = null
  }

  return (
    <div
      className="poster-print-stage"
      style={{ width: stageWidth, height: stageHeight, background: stageDoc.bg }}
      onPointerDown={() => onSelectBlock(null)}
    >
      {stageDoc.blocks.map((block) => {
        const isSelected = block.id === selectedBlockId
        const canRadius = block.type !== "text" && block.type !== "circle"
        const radiusStyle = block.radius ? `${block.radius}px` : undefined
        return (
          <div
            key={block.id}
            className={isSelected ? "stage-block selected" : "stage-block"}
            style={{
              left: block.x,
              top: block.y,
              width: block.w,
              height: block.h,
              opacity: block.opacity ?? 1,
              borderRadius: canRadius ? radiusStyle : block.type === "circle" ? "50%" : undefined,
              overflow: canRadius && block.radius ? "hidden" : undefined,
            }}
            onPointerDown={(event) => beginBlockDrag(event, block)}
            onPointerMove={moveBlockDrag}
            onPointerUp={endBlockDrag}
          >
            {block.type === "text" && (
              <span style={{ color: block.color, fontSize: block.fontSize }}>{block.text}</span>
            )}
            {block.type === "rect" && <div className="stage-rect" style={{ background: block.bgImg || block.bg, borderRadius: radiusStyle }} />}
            {block.type === "circle" && <div className="stage-circle" style={{ background: block.bgImg || block.bg }} />}
            {block.type === "image" && block.src !== "" && <img src={block.src} alt="" draggable={false} style={{ borderRadius: canRadius ? radiusStyle : undefined }} />}

            {isSelected && (
              <>
                <div className="resize-handle handle-nw" onPointerDown={(e) => beginResize(e, block, "nw")} onPointerMove={moveResize} onPointerUp={endResize} />
                <div className="resize-handle handle-n" onPointerDown={(e) => beginResize(e, block, "n")} onPointerMove={moveResize} onPointerUp={endResize} />
                <div className="resize-handle handle-ne" onPointerDown={(e) => beginResize(e, block, "ne")} onPointerMove={moveResize} onPointerUp={endResize} />
                <div className="resize-handle handle-e" onPointerDown={(e) => beginResize(e, block, "e")} onPointerMove={moveResize} onPointerUp={endResize} />
                <div className="resize-handle handle-se" onPointerDown={(e) => beginResize(e, block, "se")} onPointerMove={moveResize} onPointerUp={endResize} />
                <div className="resize-handle handle-s" onPointerDown={(e) => beginResize(e, block, "s")} onPointerMove={moveResize} onPointerUp={endResize} />
                <div className="resize-handle handle-sw" onPointerDown={(e) => beginResize(e, block, "sw")} onPointerMove={moveResize} onPointerUp={endResize} />
                <div className="resize-handle handle-w" onPointerDown={(e) => beginResize(e, block, "w")} onPointerMove={moveResize} onPointerUp={endResize} />
                {canRadius && (
                  <div
                    className="radius-handle"
                    title={TextConfig.radius}
                    onPointerDown={(e) => beginRadius(e, block)}
                    onPointerMove={moveRadius}
                    onPointerUp={endRadius}
                  />
                )}
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default PosterStage
