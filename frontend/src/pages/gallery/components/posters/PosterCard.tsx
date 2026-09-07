import type { Poster } from "../../../../libs/posters/posters.ts"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface PosterCardProps {
  poster: Poster
  onOpenPoster: () => void
  onRemovePoster: () => void
}

function PosterCard({ poster, onOpenPoster, onRemovePoster }: PosterCardProps) {
  return (
    <article className="poster-card">
      <div className="poster-card-preview">
        <span className="poster-card-format">{poster.format}</span>
      </div>
      <div className="poster-card-body">
        <h3>{poster.name}</h3>
        <p>{poster.width}×{poster.height}</p>
        <div className="poster-card-actions">
          <button onClick={onOpenPoster}>{TextConfig.open}</button>
          <button onClick={onRemovePoster}>{TextConfig.remove}</button>
        </div>
      </div>
    </article>
  )
}

export default PosterCard
