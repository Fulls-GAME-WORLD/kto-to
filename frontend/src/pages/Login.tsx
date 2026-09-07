import { useNavigate } from "react-router-dom"
import LoginForm from "../components/auth/LoginForm.tsx"

function Login() {
  const navigate = useNavigate()

  return (
    <main className="main-pages">
      <div className="pages">
        <LoginForm onDone={() => navigate("/")} />
      </div>
    </main>
  )
}

export default Login
