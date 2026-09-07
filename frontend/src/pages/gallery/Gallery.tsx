import { useNavigate } from "react-router-dom"
import PosterList from "./components/posters/PosterList.tsx"
import NewPosterButton from "./components/posters/buttons/NewPosterButton.tsx"
import TemplateList from "./components/templates/TemplateList.tsx"

import "./css/gallery.modules.css"

function Gallery() {
  const navigate = useNavigate()

  return (
    <main className="main-pages">
      <div className="pages">
        <NewPosterButton onPosterCreated={(id) => navigate(`/my/poster/${id}`)} />
        <PosterList />
        <TemplateList />
      </div>
    </main>
  )
}

export default Gallery
