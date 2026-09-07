import { useNavigate } from "react-router-dom"
import RegisterForm from "../components/auth/RegisterForm.tsx"

function Register() {
  const navigate = useNavigate()

  return (
    <main className="main-pages">
      <div className="pages">
        <RegisterForm onDone={() => navigate("/")} />
      </div>
    </main>
  )
}

export default Register
