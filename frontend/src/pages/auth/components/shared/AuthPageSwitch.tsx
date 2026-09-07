import { Link } from "react-router-dom"

interface AuthPageSwitchProps {
  to: string
  label: string
}

function AuthPageSwitch({ to, label }: AuthPageSwitchProps) {
  return (
    <div className="auth-switch">
      <Link to={to}>{label}</Link>
    </div>
  )
}

export default AuthPageSwitch
