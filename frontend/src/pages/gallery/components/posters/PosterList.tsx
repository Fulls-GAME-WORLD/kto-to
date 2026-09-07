import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listPosters, deletePoster, type Poster } from "../../../../libs/posters/posters.ts"
import PosterCard from "./PosterCard.tsx"

function PosterCardSkeleton() {
  return (
    <div className="poster-card poster-card-skeleton">
      <div className="skeleton skeleton-preview" />
      <div className="skeleton-body">
        <div className="skeleton" style={{ height: 16, width: "70%" }} />
        <div className="skeleton" style={{ height: 12, width: "40%" }} />
        <div className="skeleton" style={{ height: 36, width: "100%", marginTop: 8 }} />
      </div>
    </div>
  )
}

function PosterList() {
  const navigate = useNavigate()
  const [posters, setPosters] = useState<Poster[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listPosters()
      .then(setPosters)
      .catch(() => setPosters([]))
      .finally(() => setLoading(false))
  }, [])

  async function removePosterById(id: number) {
    await deletePoster(id)
    setPosters((prev) => prev.filter((poster) => poster.id !== id))
  }

  if (loading) {
    return (
      <section className="poster-list">
        <div className="poster-grid">
          <PosterCardSkeleton />
          <PosterCardSkeleton />
          <PosterCardSkeleton />
          <PosterCardSkeleton />
        </div>
      </section>
    )
  }

  if (posters.length === 0) {
    return (
      <section className="poster-list">
        <div className="gallery-empty">No posters yet — create your first one above.</div>
      </section>
    )
  }

  return (
    <section className="poster-list">
      <div className="poster-grid">
        {posters.map((poster) => (
          <PosterCard
            key={poster.id}
            poster={poster}
            onOpenPoster={() => navigate(`/my/poster/${poster.id}`)}
            onRemovePoster={() => removePosterById(poster.id)}
          />
        ))}
      </div>
    </section>
  )
}

export default PosterList
