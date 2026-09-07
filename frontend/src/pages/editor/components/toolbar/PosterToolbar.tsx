import { useRef } from "react"
import type { ChangeEvent } from "react"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface PosterToolbarProps {
  onAddTextBlock: () => void
  onAddRectBlock: () => void
  onAddCircleBlock: () => void
  onUploadImageFile: (file: File) => void
  onPrintPoster: () => void
  onExportPosterPng: () => void
}

function PosterToolbar({ onAddTextBlock, onAddRectBlock, onAddCircleBlock, onUploadImageFile, onPrintPoster, onExportPosterPng }: PosterToolbarProps) {
  const fileInput = useRef<HTMLInputElement>(null)

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) {
      onUploadImageFile(file)
    }
    event.target.value = ""
  }

  return (
    <div className="poster-toolbar">
      <button onClick={onAddTextBlock}>{TextConfig.addText}</button>
      <button onClick={onAddRectBlock}>{TextConfig.addRect}</button>
      <button onClick={onAddCircleBlock}>{TextConfig.addCircle}</button>
      <button onClick={() => fileInput.current?.click()}>{TextConfig.uploadImage}</button>
      <input ref={fileInput} type="file" accept="image/*" hidden onChange={handleFileChange} />
      <button onClick={onPrintPoster}>{TextConfig.print}</button>
      <button onClick={onExportPosterPng}>{TextConfig.exportPng}</button>
    </div>
  )
}

export default PosterToolbar
