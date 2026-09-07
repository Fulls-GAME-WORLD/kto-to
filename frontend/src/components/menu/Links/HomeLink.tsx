import { NavLink } from "react-router-dom"
import TextConfig from "../../../libs/configs/site/text.configs.ts"

function HomeLink() {
  return (
    <NavLink to="/" className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
      {TextConfig.navHome}
    </NavLink>
  )
}

export default HomeLink
