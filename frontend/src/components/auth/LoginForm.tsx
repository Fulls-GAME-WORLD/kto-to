import { useState } from "react"
import type { FormEvent } from "react"
import { login } from "../../libs/auth/auth.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"
import AuthTitle from "./atoms/AuthTitle.tsx"
import AuthError from "./atoms/AuthError.tsx"
import EmailInput from "./inputs/EmailInput.tsx"
import PasswordInput from "./inputs/PasswordInput.tsx"
import SubmitButton from "./buttons/SubmitButton.tsx"
import AuthSwitch from "./buttons/AuthSwitch.tsx"

interface LoginFormProps {
  onDone: () => void
}

function LoginForm({ onDone }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError("")
    try {
      await login(email, password)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "error")
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <AuthTitle title={TextConfig.login} />
      <EmailInput value={email} onChange={setEmail} />
      <PasswordInput value={password} onChange={setPassword} />
      <AuthError message={error} />
      <SubmitButton label={TextConfig.doLogin} />
      <AuthSwitch to="/register" label={TextConfig.noAccount} />
    </form>
  )
}

export default LoginForm
