import { useRef, useState } from "react"
import type { ChangeEvent, DragEvent } from "react"
import TextConfig from "../../../../../libs/configs/site/text.configs.ts"

interface FileDropzoneProps {
  fileName: string | null
  onFileLoaded: (name: string, content: string) => void
}

function FileDropzone({ fileName, onFileLoaded }: FileDropzoneProps) {
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function readHtmlFile(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      if (content) {
        onFileLoaded(file.name, content)
      }
    }
    reader.readAsText(file)
  }

  function handleFileInputChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) {
      readHtmlFile(file)
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file && (file.name.endsWith(".html") || file.name.endsWith(".htm") || file.type.includes("html"))) {
      readHtmlFile(file)
    }
  }

  return (
    <div
      className={`file-dropzone ${dragOver ? "dragover" : ""}`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.htm"
        hidden
        onChange={handleFileInputChange}
      />
      <div className="dropzone-icon">📄</div>
      <p className="dropzone-title">
        {fileName ? fileName : TextConfig.dropzoneHint}
      </p>
      <span className="dropzone-subtitle">{TextConfig.dropzoneOrBrowse}</span>
    </div>
  )
}

export default FileDropzone
