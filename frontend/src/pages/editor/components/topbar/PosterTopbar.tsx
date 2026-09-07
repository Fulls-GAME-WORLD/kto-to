import { Link } from "react-router-dom"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface PosterTopbarProps {
  posterName: string
  posterFormat: string
  saveLabel: string
  onPosterNameChange: (name: string) => void
}

function PosterTopbar({ posterName, posterFormat, saveLabel, onPosterNameChange }: PosterTopbarProps) {
  return (
    <div className="poster-topbar">
      <Link to="/my/gallery">{TextConfig.backToGallery}</Link>
      <label>
        {TextConfig.posterNameLabel}
        <input type="text" value={posterName} onChange={(event) => onPosterNameChange(event.target.value)} />
      </label>
      <span>{posterFormat}</span>
      <span>{saveLabel}</span>
    </div>
  )
}

export default PosterTopbar
