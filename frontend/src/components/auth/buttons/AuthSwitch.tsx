import { Link } from "react-router-dom"

interface AuthSwitchProps {
  to: string
  label: string
}

function AuthSwitch({ to, label }: AuthSwitchProps) {
  return (
    <div className="auth-switch">
      <Link to={to}>{label}</Link>
    </div>
  )
}

export default AuthSwitch
