import { useState } from "react"
import type { SceneDoc } from "../../../../libs/editor/scene.ts"
import { convertHtmlToSceneBlocks } from "../../../../libs/editor/html-importer.ts"
import { SAMPLE_HTML } from "./constants/sample-html.ts"
import ModalHeader from "./components/ModalHeader.tsx"
import ModalTabs from "./components/ModalTabs.tsx"
import CodeInputSection from "./components/CodeInputSection.tsx"
import FileDropzone from "./components/FileDropzone.tsx"
import ImportOptionsView from "./components/ImportOptionsView.tsx"
import ModalFooter from "./components/ModalFooter.tsx"

interface HtmlImportModalProps {
  isOpen: boolean
  onClose: () => void
  currentDoc: SceneDoc
  stageWidth: number
  stageHeight: number
  onApplyImport: (newDoc: SceneDoc, newWidth?: number, newHeight?: number) => void
}

function HtmlImportModal({
  isOpen,
  onClose,
  currentDoc,
  stageWidth,
  stageHeight,
  onApplyImport,
}: HtmlImportModalProps) {
  const [activeTab, setActiveTab] = useState<"code" | "file">("code")
  const [htmlCode, setHtmlCode] = useState(SAMPLE_HTML)
  const [replaceCanvas, setReplaceCanvas] = useState(true)
  const [resizeCanvas, setResizeCanvas] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  if (!isOpen) return null

  function handleFileLoaded(name: string, content: string) {
    setFileName(name)
    setHtmlCode(content)
  }

  async function handleImport() {
    if (!htmlCode.trim()) return
    setIsProcessing(true)

    try {
      const result = await convertHtmlToSceneBlocks(
        htmlCode,
        {
          replaceCanvas,
          resizeCanvasToFit: resizeCanvas,
          defaultWidth: stageWidth,
          defaultHeight: stageHeight,
        },
        currentDoc
      )

      onApplyImport(result.doc, result.width, result.height)
      onClose()
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container figma-import-modal" onClick={(e) => e.stopPropagation()}>
        <ModalHeader onClose={onClose} />
        <ModalTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="modal-body">
          {activeTab === "code" ? (
            <CodeInputSection htmlCode={htmlCode} onChange={setHtmlCode} />
          ) : (
            <FileDropzone fileName={fileName} onFileLoaded={handleFileLoaded} />
          )}
          <ImportOptionsView
            replaceCanvas={replaceCanvas}
            resizeCanvas={resizeCanvas}
            onToggleReplaceCanvas={setReplaceCanvas}
            onToggleResizeCanvas={setResizeCanvas}
          />
        </div>
        <ModalFooter
          onClose={onClose}
          onImport={handleImport}
          isProcessing={isProcessing}
          hasContent={Boolean(htmlCode.trim())}
        />
      </div>
    </div>
  )
}

export default HtmlImportModal
