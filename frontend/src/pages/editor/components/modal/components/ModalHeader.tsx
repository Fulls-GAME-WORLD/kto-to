import TextConfig from "../../../../../libs/configs/site/text.configs.ts"

interface ModalHeaderProps {
  onClose: () => void
}

function ModalHeader({ onClose }: ModalHeaderProps) {
  return (
    <div className="modal-header">
      <div className="modal-title-group">
        <span className="modal-badge">{TextConfig.importBadge}</span>
        <h2>{TextConfig.importHtmlTitle}</h2>
      </div>
      <button className="modal-close-btn" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}

export default ModalHeader
