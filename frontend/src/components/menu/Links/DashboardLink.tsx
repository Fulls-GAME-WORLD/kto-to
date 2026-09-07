import { NavLink } from "react-router-dom"
import TextConfig from "../../../libs/configs/site/text.configs.ts"

function DashboardLink() {
  return (
    <NavLink to="/my/dashboard" className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
      {TextConfig.dashboard}
    </NavLink>
  )
}

export default DashboardLink
