import { useNavigate } from "react-router-dom"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"
import { clearAuthSession } from "../../../../libs/auth/session.ts"

function ProfileLogoutButton() {
  const navigate = useNavigate()

  function handleProfileLogout() {
    clearAuthSession()
    navigate("/start/auth/login", { replace: true })
  }

  return <button onClick={handleProfileLogout}>{TextConfig.logout}</button>
}

export default ProfileLogoutButton
