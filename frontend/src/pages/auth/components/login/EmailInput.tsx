import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface LoginEmailProps {
  value: string
  onChange: (value: string) => void
}

function LoginEmail({ value, onChange }: LoginEmailProps) {
  return (
    <div className="form-item-email">
      <label htmlFor="login-email">{TextConfig.email}</label>
      <input
        id="login-email"
        type="email"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="email"
        required
      />
    </div>
  )
}

export default LoginEmail
