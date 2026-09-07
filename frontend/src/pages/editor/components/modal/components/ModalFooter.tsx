import TextConfig from "../../../../../libs/configs/site/text.configs.ts"

interface ModalFooterProps {
  onClose: () => void
  onImport: () => void
  isProcessing: boolean
  hasContent: boolean
}

function ModalFooter({ onClose, onImport, isProcessing, hasContent }: ModalFooterProps) {
  return (
    <div className="modal-footer">
      <button type="button" className="btn-secondary" onClick={onClose}>
        {TextConfig.cancelBtn}
      </button>
      <button
        type="button"
        className="btn-primary"
        onClick={onImport}
        disabled={isProcessing || !hasContent}
      >
        {isProcessing ? TextConfig.loading : TextConfig.importBtn}
      </button>
    </div>
  )
}

export default ModalFooter
