import { NavLink } from "react-router-dom"
import TextConfig from "../../../libs/configs/site/text.configs.ts"

function ProfileLink() {
  return (
    <NavLink to="/my/profile" className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
      {TextConfig.navProfile}
    </NavLink>
  )
}

export default ProfileLink
