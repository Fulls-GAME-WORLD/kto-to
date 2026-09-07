import { NavLink } from "react-router-dom"
import TextConfig from "../../../libs/configs/site/text.configs.ts"

function RegisterLink() {
  return (
    <NavLink to="/start/auth/register" className={({ isActive }) => `menu-link${isActive ? " active" : ""}`}>
      {TextConfig.register}
    </NavLink>
  )
}

export default RegisterLink
