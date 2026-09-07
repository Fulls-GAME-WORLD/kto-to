import { useNavigate } from "react-router-dom"
import { type FormEvent, useState } from "react"
import { loginInMyAccount } from "../../libs/auth/login.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"
import LoginEmail from "./components/login/EmailInput.tsx"
import LoginPassword from "./components/login/PasswordInput.tsx"
import LoginButtons from "./components/login/Buttons.tsx"
import AuthFormTitle from "./components/shared/AuthFormTitle.tsx"
import AuthFormError from "./components/shared/AuthFormError.tsx"
import AuthPageSwitch from "./components/shared/AuthPageSwitch.tsx"

import "./css/login.modules.css"
import "./css/inputs.modules.css"
import "./css/buttons.modules.css"
import "./css/text.modules.css"

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function submitLoginForm(event: FormEvent) {
    event.preventDefault()
    setError("")
    try {
      await loginInMyAccount(email, password)
      navigate("/my/gallery", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "error")
    }
  }

  return (
    <main className="main-pages">
      <div className="pages">
        <form className="auth-form" onSubmit={submitLoginForm}>
          <AuthFormTitle title={TextConfig.login} />
          <LoginEmail value={email} onChange={setEmail} />
          <LoginPassword value={password} onChange={setPassword} />
          <AuthFormError message={error} />
          <LoginButtons />
          <AuthPageSwitch to="/start/auth/register" label={TextConfig.noAccount} />
        </form>
      </div>
    </main>
  )
}

export default Login
