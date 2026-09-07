import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import MainMenu from "../../components/menu/MainMenu.tsx"
import { getPoster, updatePoster } from "../../libs/posters/posters.ts"
import { resolveAssetUrl, uploadAsset } from "../../libs/assets/assets.ts"
import { emptyScene, makeBlock, parseScene, serializeScene, type BlockType, type SceneBlock, type SceneDoc,} from "../../libs/editor/scene.ts"
import { exportSceneToPng } from "../../libs/editor/export-png.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"
import PosterTopbar from "./components/topbar/PosterTopbar.tsx"
import PosterToolbar from "./components/toolbar/PosterToolbar.tsx"
import PosterStage from "./components/stage/PosterStage.tsx"
import PosterPropsPanel from "./components/props/PosterPropsPanel.tsx"
import PosterLayersPanel from "./components/layers/PosterLayersPanel.tsx"
import EditorLoadingState from "./components/States/EditorLoadingState.tsx"
import EditorErrorAlert from "./components/States/EditorErrorAlert.tsx"

import "./css/editor.modules.css"

function Editor() {
  const { posterId } = useParams<{ posterId: string }>()
  const [posterName, setPosterName] = useState("")
  const [posterFormat, setPosterFormat] = useState("")
  const [stageWidth, setStageWidth] = useState(794)
  const [stageHeight, setStageHeight] = useState(1123)
  const [stageDoc, setStageDoc] = useState<SceneDoc>(() => emptyScene())
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [saveLabel, setSaveLabel] = useState(TextConfig.saved)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!posterId) {
      setError("no id")
      setLoading(false)
      return
    }
    getPoster(Number(posterId))
      .then((poster) => {
        setPosterName(poster.name)
        setPosterFormat(poster.format)
        setStageWidth(poster.width)
        setStageHeight(poster.height)
        setStageDoc(parseScene(poster.scene))
        setLoading(false)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "error")
        setLoading(false)
      })
  }, [posterId])

  const persistScene = useCallback(
    (nextDoc: SceneDoc, nextName: string) => {
      if (!posterId) {
        return
      }
      setSaveLabel(TextConfig.save)
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current)
      }
      const posterNumericId = Number(posterId)
      const scenePayload = serializeScene(nextDoc)
      saveTimer.current = window.setTimeout(() => {
        updatePoster(posterNumericId, { name: nextName, scene: scenePayload })
          .then(() => setSaveLabel(TextConfig.saved))
          .catch(() => setSaveLabel(TextConfig.saveError))
      }, 800)
    },
    [posterId],
  )

  function applyDoc(nextDoc: SceneDoc) {
    setStageDoc(nextDoc)
    persistScene(nextDoc, posterName)
  }

  function handlePosterNameChange(nextName: string) {
    setPosterName(nextName)
    persistScene(stageDoc, nextName)
  }

  function handleAddBlock(blockType: BlockType) {
    applyDoc({ ...stageDoc, blocks: [...stageDoc.blocks, makeBlock(blockType)] })
  }

  async function handleUploadImageFile(file: File) {
    const asset = await uploadAsset(file)
    const imageBlock: SceneBlock = {
      ...makeBlock("image"),
      src: resolveAssetUrl(asset.url),
    }
    applyDoc({ ...stageDoc, blocks: [...stageDoc.blocks, imageBlock] })
  }

  function handleMoveBlock(id: string, x: number, y: number) {
    setStageDoc((prev) => {
      const next: SceneDoc = {
        ...prev,
        blocks: prev.blocks.map((block) => (block.id === id ? { ...block, x, y } : block)),
      }
      persistScene(next, posterName)
      return next
    })
  }

  function handleBlockPatch(id: string, patch: Partial<SceneBlock>) {
    applyDoc({
      ...stageDoc,
      blocks: stageDoc.blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)),
    })
  }

  function handleMoveBlockUp(id: string) {
    const index = stageDoc.blocks.findIndex((block) => block.id === id)
    if (index < 0 || index === stageDoc.blocks.length - 1) {
      return
    }
    const blocks = [...stageDoc.blocks]
    const [moved] = blocks.splice(index, 1)
    blocks.splice(index + 1, 0, moved)
    applyDoc({ ...stageDoc, blocks })
  }

  function handleMoveBlockDown(id: string) {
    const index = stageDoc.blocks.findIndex((block) => block.id === id)
    if (index <= 0) {
      return
    }
    const blocks = [...stageDoc.blocks]
    const [moved] = blocks.splice(index, 1)
    blocks.splice(index - 1, 0, moved)
    applyDoc({ ...stageDoc, blocks })
  }

  function handleDeleteBlock(id: string) {
    applyDoc({ ...stageDoc, blocks: stageDoc.blocks.filter((block) => block.id !== id) })
    setSelectedBlockId((prev) => (prev === id ? null : prev))
  }

  function handlePrintPoster() {
    window.print()
  }

  function handleExportPosterPng() {
    void exportSceneToPng(stageDoc, stageWidth, stageHeight, `${posterName || "poster"}.png`)
  }

  const selectedBlock = stageDoc.blocks.find((block) => block.id === selectedBlockId) ?? null

  return (
    <>
      <MainMenu />
      <main className="main-pages editor-page">
        <div className="pages">
          {loading && <EditorLoadingState />}
          {!loading && error !== "" && <EditorErrorAlert message={error} />}
          {!loading && error === "" && (
            <div className="editor-shell">
              <PosterTopbar
                posterName={posterName}
                posterFormat={posterFormat}
                saveLabel={saveLabel}
                onPosterNameChange={handlePosterNameChange}
              />
              <PosterToolbar
                onAddTextBlock={() => handleAddBlock("text")}
                onAddRectBlock={() => handleAddBlock("rect")}
                onAddCircleBlock={() => handleAddBlock("circle")}
                onUploadImageFile={(file) => void handleUploadImageFile(file)}
                onPrintPoster={handlePrintPoster}
                onExportPosterPng={handleExportPosterPng}
              />
              <div className="editor-main">
                <div className="editor-canvas-wrap">
                <PosterStage
                  stageDoc={stageDoc}
                  stageWidth={stageWidth}
                  stageHeight={stageHeight}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  onMoveBlock={handleMoveBlock}
                />
              </div>
              <div className="editor-side">
                <PosterPropsPanel
                  stageDoc={stageDoc}
                  selectedBlock={selectedBlock}
                  onCanvasBgChange={(bg) => applyDoc({ ...stageDoc, bg })}
                  onBlockPatch={handleBlockPatch}
                />
                <PosterLayersPanel
                  stageBlocks={stageDoc.blocks}
                  selectedBlockId={selectedBlockId}
                  onSelectBlock={setSelectedBlockId}
                  onMoveBlockUp={handleMoveBlockUp}
                  onMoveBlockDown={handleMoveBlockDown}
                  onDeleteBlock={handleDeleteBlock}
                />
              </div>
            </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

export default Editor
