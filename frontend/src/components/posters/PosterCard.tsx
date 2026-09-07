import type { Poster } from "../../libs/posters/posters.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"

interface PosterCardProps {
  poster: Poster
  onOpen: () => void
  onRemove: () => void
}

function PosterCard({ poster, onOpen, onRemove }: PosterCardProps) {
  return (
    <article className="poster-card">
      <h3>{poster.name}</h3>
      <p>{poster.format} · {poster.width}x{poster.height}</p>
      <div className="poster-card-actions">
        <button onClick={onOpen}>{TextConfig.open}</button>
        <button onClick={onRemove}>{TextConfig.remove}</button>
      </div>
    </article>
  )
}

export default PosterCard
