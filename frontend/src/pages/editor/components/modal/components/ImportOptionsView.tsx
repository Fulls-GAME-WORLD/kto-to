import TextConfig from "../../../../../libs/configs/site/text.configs.ts"

interface ImportOptionsViewProps {
  replaceCanvas: boolean
  resizeCanvas: boolean
  onToggleReplaceCanvas: (checked: boolean) => void
  onToggleResizeCanvas: (checked: boolean) => void
}

function ImportOptionsView({
  replaceCanvas,
  resizeCanvas,
  onToggleReplaceCanvas,
  onToggleResizeCanvas,
}: ImportOptionsViewProps) {
  return (
    <div className="import-options">
      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={replaceCanvas}
          onChange={(e) => onToggleReplaceCanvas(e.target.checked)}
        />
        <span>{TextConfig.importReplaceBlocks}</span>
      </label>

      <label className="checkbox-label">
        <input
          type="checkbox"
          checked={resizeCanvas}
          onChange={(e) => onToggleResizeCanvas(e.target.checked)}
        />
        <span>{TextConfig.importResizeCanvas}</span>
      </label>
    </div>
  )
}

export default ImportOptionsView
