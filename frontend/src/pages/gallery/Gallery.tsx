import { useNavigate } from "react-router-dom"
import MainMenu from "../../components/menu/MainMenu.tsx"
import PosterList from "./components/posters/PosterList.tsx"
import NewPosterButton from "./components/posters/buttons/NewPosterButton.tsx"
import TemplateList from "./components/templates/TemplateList.tsx"
import TextConfig from "../../libs/configs/site/text.configs.ts"

import "./css/gallery.modules.css"

function Gallery() {
  const navigate = useNavigate()

  return (
    <>
      <MainMenu />
      <main className="main-pages">
        <div className="pages">
          <div className="gallery-header">
            <div>
              <h1>{TextConfig.myPosters}</h1>
              <p>{TextConfig.posterName} · drag & drop · print ready</p>
            </div>
            <div className="gallery-actions">
              <NewPosterButton onPosterCreated={(id) => navigate(`/my/poster/${id}`)} />
            </div>
          </div>
          <PosterList />
          <TemplateList />
        </div>
      </main>
    </>
  )
}

export default Gallery
