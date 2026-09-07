import { useState } from "react"
import type { FormEvent } from "react"
import { login } from "../../libs/auth/auth.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"

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
      <h2>{TextConfig.login}</h2>
      <label>
        {TextConfig.email}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        {TextConfig.password}
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {error !== "" && <p className="auth-error">{error}</p>}
      <button type="submit">{TextConfig.doLogin}</button>
    </form>
  )
}

export default LoginForm
