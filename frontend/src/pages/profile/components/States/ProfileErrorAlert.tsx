import { Link } from "react-router-dom"
import TextConfig from "../../../libs/configs/site/text.configs.ts"

interface ProfileErrorAlertProps {
  message: string
}

function ProfileErrorAlert({ message }: ProfileErrorAlertProps) {
  return (
    <div className="profile-error">
      <p>{TextConfig.notAuthorized}: {message}</p>
      <Link to="/start/auth/login">{TextConfig.goLogin}</Link>
    </div>
  )
}

export default ProfileErrorAlert
