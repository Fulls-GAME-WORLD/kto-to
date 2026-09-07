import { NavLink } from "react-router-dom"
import TextConfig from "../../../libs/configs/site/text.configs.ts"

function LoginLink() {
  return (
    <NavLink to="/start/auth/login" className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
      {TextConfig.login}
    </NavLink>
  )
}

export default LoginLink
