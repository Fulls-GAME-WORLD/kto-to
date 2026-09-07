import type { SceneBlock } from "../../../../libs/editor/scene.ts"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface PosterLayersPanelProps {
  stageBlocks: SceneBlock[]
  selectedBlockId: string | null
  onSelectBlock: (id: string) => void
  onMoveBlockUp: (id: string) => void
  onMoveBlockDown: (id: string) => void
  onDeleteBlock: (id: string) => void
}

function PosterLayersPanel({ stageBlocks, selectedBlockId, onSelectBlock, onMoveBlockUp, onMoveBlockDown, onDeleteBlock }: PosterLayersPanelProps) {
  return (
    <aside className="poster-layers">
      <h3>{TextConfig.layers}</h3>
      <ul>
        {stageBlocks.map((block) => (
          <li key={block.id} className={block.id === selectedBlockId ? "active" : ""}>
            <button onClick={() => onSelectBlock(block.id)}>
              {block.type} · {block.id.slice(-4)}
            </button>
            <button onClick={() => onMoveBlockUp(block.id)}>{TextConfig.moveBlockUp}</button>
            <button onClick={() => onMoveBlockDown(block.id)}>{TextConfig.moveBlockDown}</button>
            <button onClick={() => onDeleteBlock(block.id)}>{TextConfig.deleteBlock}</button>
          </li>
        ))}
      </ul>
    </aside>
  )
}

export default PosterLayersPanel
