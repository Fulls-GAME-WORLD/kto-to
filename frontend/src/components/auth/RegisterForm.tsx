import { useState } from "react"
import type { FormEvent } from "react"
import { register } from "../../libs/auth/auth.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"

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
      <h2>{TextConfig.register}</h2>
      <label>
        {TextConfig.name}
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </label>
      <label>
        {TextConfig.email}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </label>
      <label>
        {TextConfig.password}
        <input type="password" value={password} minLength={8} onChange={(e) => setPassword(e.target.value)} required />
      </label>
      {error !== "" && <p className="auth-error">{error}</p>}
      <button type="submit">{TextConfig.doRegister}</button>
    </form>
  )
}

export default RegisterForm
