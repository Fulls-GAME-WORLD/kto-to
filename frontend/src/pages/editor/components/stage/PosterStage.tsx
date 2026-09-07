import { useRef } from "react"
import type { PointerEvent as ReactPointerEvent } from "react"
import type { SceneBlock, SceneDoc } from "../../../../libs/editor/scene.ts"

interface PosterStageProps {
  stageDoc: SceneDoc
  stageWidth: number
  stageHeight: number
  selectedBlockId: string | null
  onSelectBlock: (id: string | null) => void
  onMoveBlock: (id: string, x: number, y: number) => void
}

function PosterStage({ stageDoc, stageWidth, stageHeight, selectedBlockId, onSelectBlock, onMoveBlock }: PosterStageProps) {
  const dragState = useRef<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)

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

  return (
    <div
      className="poster-print-stage"
      style={{ width: stageWidth, height: stageHeight, background: stageDoc.bg }}
      onPointerDown={() => onSelectBlock(null)}
    >
      {stageDoc.blocks.map((block) => (
        <div
          key={block.id}
          className={block.id === selectedBlockId ? "stage-block selected" : "stage-block"}
          style={{ left: block.x, top: block.y, width: block.w, height: block.h }}
          onPointerDown={(event) => beginBlockDrag(event, block)}
          onPointerMove={moveBlockDrag}
          onPointerUp={endBlockDrag}
        >
          {block.type === "text" && (
            <span style={{ color: block.color, fontSize: block.fontSize }}>{block.text}</span>
          )}
          {block.type === "rect" && <div className="stage-rect" style={{ background: block.bg }} />}
          {block.type === "circle" && <div className="stage-circle" style={{ background: block.bg }} />}
          {block.type === "image" && block.src !== "" && <img src={block.src} alt="" draggable={false} />}
        </div>
      ))}
    </div>
  )
}

export default PosterStage
