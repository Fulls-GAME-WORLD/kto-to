import { useNavigate } from "react-router-dom"
import TextConfig from "../../../libs/configs/site/text.configs.ts"
import { clearAuthSession } from "../../../libs/auth/session.ts"

function LogoutLink() {
  const navigate = useNavigate()

  function handleLogout() {
    clearAuthSession()
    navigate("/start/auth/login", { replace: true })
  }

  return (
    <button type="button" onClick={handleLogout} className="menu-link menu-link-button">
      {TextConfig.logout}
    </button>
  )
}

export default LogoutLink
