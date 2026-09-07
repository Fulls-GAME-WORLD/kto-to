import { useState } from "react"
import type { FormEvent } from "react"
import { register } from "../../libs/auth/auth.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"
import AuthTitle from "./atoms/AuthTitle.tsx"
import AuthError from "./atoms/AuthError.tsx"
import NameInput from "./inputs/NameInput.tsx"
import EmailInput from "./inputs/EmailInput.tsx"
import PasswordInput from "./inputs/PasswordInput.tsx"
import SubmitButton from "./buttons/SubmitButton.tsx"
import AuthSwitch from "./buttons/AuthSwitch.tsx"

interface RegisterFormProps {
  onDone: () => void
}

function RegisterForm({ onDone }: RegisterFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError("")
    try {
      await register(name, email, password)
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : "error")
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <AuthTitle title={TextConfig.register} />
      <NameInput value={name} onChange={setName} />
      <EmailInput value={email} onChange={setEmail} />
      <PasswordInput value={password} onChange={setPassword} />
      <AuthError message={error} />
      <SubmitButton label={TextConfig.doRegister} />
      <AuthSwitch to="/login" label={TextConfig.haveAccount} />
    </form>
  )
}

export default RegisterForm
