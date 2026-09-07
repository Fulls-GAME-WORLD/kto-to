import { createPoster } from "../../../../libs/posters/posters.ts"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface NewPosterButtonProps {
  onPosterCreated: (id: number) => void
}

function NewPosterButton({ onPosterCreated }: NewPosterButtonProps) {
  async function createNewPoster() {
    const poster = await createPoster({
      name: "Untitled",
      format: "A4",
      width: 794,
      height: 1123,
      scene: '{"v":1,"bg":"#ffffff","blocks":[]}',
    })
    onPosterCreated(poster.id)
  }

  return <button onClick={createNewPoster}>{TextConfig.newPoster}</button>
}

export default NewPosterButton
