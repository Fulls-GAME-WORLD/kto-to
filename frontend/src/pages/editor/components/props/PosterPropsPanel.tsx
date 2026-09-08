import type { SceneBlock, SceneDoc } from "../../../../libs/editor/scene.ts"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface PosterPropsPanelProps {
  stageDoc: SceneDoc
  selectedBlock: SceneBlock | null
  onCanvasBgChange: (bg: string) => void
  onBlockPatch: (id: string, patch: Partial<SceneBlock>) => void
}

function PosterPropsPanel({ stageDoc, selectedBlock, onCanvasBgChange, onBlockPatch }: PosterPropsPanelProps) {
  return (
    <aside className="poster-props">
      <h3>{TextConfig.props}</h3>
      <label>
        {TextConfig.canvasBg}
        <input type="color" value={stageDoc.bg} onChange={(event) => onCanvasBgChange(event.target.value)} />
      </label>
      {!selectedBlock && <p>{TextConfig.selectBlockHint}</p>}
      {selectedBlock && (
        <>
          {(selectedBlock.type === "text") && (
            <label>
              {TextConfig.blockText}
              <input
                type="text"
                value={selectedBlock.text}
                onChange={(event) => onBlockPatch(selectedBlock.id, { text: event.target.value })}
              />
            </label>
          )}
          {(selectedBlock.type === "text") && (
            <label>
              {TextConfig.blockFontSize}
              <input
                type="number"
                value={selectedBlock.fontSize}
                onChange={(event) => onBlockPatch(selectedBlock.id, { fontSize: Number(event.target.value) })}
              />
            </label>
          )}
          {(selectedBlock.type === "text") && (
            <label>
              {TextConfig.fill}
              <input
                type="color"
                value={selectedBlock.color}
                onChange={(event) => onBlockPatch(selectedBlock.id, { color: event.target.value })}
              />
            </label>
          )}
          {(selectedBlock.type === "rect" || selectedBlock.type === "circle") && (
            <label>
              {TextConfig.blockFill}
              <input
                type="color"
                value={selectedBlock.bg}
                onChange={(event) => onBlockPatch(selectedBlock.id, { bg: event.target.value, bgImg: "" })}
              />
            </label>
          )}
          <label>
            {TextConfig.blockWidth}
            <input
              type="number"
              value={Math.round(selectedBlock.w)}
              onChange={(event) => onBlockPatch(selectedBlock.id, { w: Number(event.target.value) })}
            />
          </label>
          <label>
            {TextConfig.blockHeight}
            <input
              type="number"
              value={Math.round(selectedBlock.h)}
              onChange={(event) => onBlockPatch(selectedBlock.id, { h: Number(event.target.value) })}
            />
          </label>
          {(selectedBlock.type === "rect" || selectedBlock.type === "image") && (
            <label>
              {TextConfig.radius}
              <input
                type="number"
                min={0}
                max={Math.min(selectedBlock.w, selectedBlock.h) / 2}
                value={Math.round(selectedBlock.radius || 0)}
                onChange={(event) => onBlockPatch(selectedBlock.id, { radius: Math.max(0, Number(event.target.value)) })}
              />
            </label>
          )}
          <label>
            {TextConfig.opacity}
            <input
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={selectedBlock.opacity ?? 1}
              onChange={(event) => onBlockPatch(selectedBlock.id, { opacity: Math.max(0, Math.min(1, Number(event.target.value))) })}
            />
          </label>
        </>
      )}
    </aside>
  )
}

export default PosterPropsPanel
