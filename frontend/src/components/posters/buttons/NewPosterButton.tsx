import { createPoster } from "../../libs/posters/posters.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"

interface NewPosterButtonProps {
  onCreated: (id: number) => void
}

function NewPosterButton({ onCreated }: NewPosterButtonProps) {
  async function create() {
    const poster = await createPoster({
      name: "Untitled",
      format: "A4",
      width: 794,
      height: 1123,
      scene: '{"v":1,"bg":"#ffffff","blocks":[]}',
    })
    onCreated(poster.id)
  }

  return <button onClick={create}>{TextConfig.newPoster}</button>
}

export default NewPosterButton
