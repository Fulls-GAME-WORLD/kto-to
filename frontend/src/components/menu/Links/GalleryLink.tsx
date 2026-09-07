import { NavLink } from "react-router-dom"
import TextConfig from "../../../libs/configs/site/text.configs.ts"

function GalleryLink() {
  return (
    <NavLink to="/my/gallery" className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
      {TextConfig.navGallery}
    </NavLink>
  )
}

export default GalleryLink
