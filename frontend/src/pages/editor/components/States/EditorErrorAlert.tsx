import { Link } from "react-router-dom"
import TextConfig from "../../../libs/configs/site/text.configs.ts"

interface EditorErrorAlertProps {
  message: string
}

function EditorErrorAlert({ message }: EditorErrorAlertProps) {
  return (
    <div className="editor-error">
      <p>{TextConfig.notAuthorized}: {message}</p>
      <Link to="/start/auth/login">{TextConfig.goLogin}</Link>
    </div>
  )
}

export default EditorErrorAlert
