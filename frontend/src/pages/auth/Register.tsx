import { useNavigate } from "react-router-dom"
import { type FormEvent, useState } from "react"
import { registerMyNewAccount } from "../../libs/auth/registers.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"
import RegisterName from "./components/registers/Name.tsx"
import RegisterEmail from "./components/registers/EmailInput.tsx"
import RegisterPassword from "./components/registers/PasswordInput.tsx"
import RegisterButtons from "./components/registers/Buttons.tsx"
import AuthFormTitle from "./components/shared/AuthFormTitle.tsx"
import AuthFormError from "./components/shared/AuthFormError.tsx"
import AuthPageSwitch from "./components/shared/AuthPageSwitch.tsx"

import "./css/login.modules.css"
import "./css/inputs.modules.css"
import "./css/buttons.modules.css"
import "./css/text.modules.css"

function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function submitRegisterForm(event: FormEvent) {
    event.preventDefault()
    setError("")
    try {
      await registerMyNewAccount(name, email, password)
      navigate("/my/gallery", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "error")
    }
  }

  return (
    <main className="main-pages">
      <div className="pages">
        <form className="auth-form" onSubmit={submitRegisterForm}>
          <AuthFormTitle title={TextConfig.register} />
          <RegisterName value={name} onChange={setName} />
          <RegisterEmail value={email} onChange={setEmail} />
          <RegisterPassword value={password} onChange={setPassword} />
          <AuthFormError message={error} />
          <RegisterButtons />
          <AuthPageSwitch to="/start/auth/login" label={TextConfig.haveAccount} />
        </form>
      </div>
    </main>
  )
}

export default Register
