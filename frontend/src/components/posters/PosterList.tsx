import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listPosters, deletePoster, type Poster } from "../../libs/posters/posters.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"
import PosterCard from "./PosterCard.tsx"

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

  async function remove(id: number) {
    await deletePoster(id)
    setPosters((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading) {
    return <p>{TextConfig.loading}</p>
  }

  return (
    <section className="poster-list">
      <h2>{TextConfig.myPosters}</h2>
      <div className="poster-grid">
        {posters.map((poster) => (
          <PosterCard
            key={poster.id}
            poster={poster}
            onOpen={() => navigate(`/editor/${poster.id}`)}
            onRemove={() => remove(poster.id)}
          />
        ))}
      </div>
    </section>
  )
}

export default PosterList
