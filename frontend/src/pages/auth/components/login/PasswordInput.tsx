import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface LoginPasswordProps {
  value: string
  onChange: (value: string) => void
}

function LoginPassword({ value, onChange }: LoginPasswordProps) {
  return (
    <div className="form-item-password">
      <label htmlFor="login-password">{TextConfig.password}</label>
      <input
        id="login-password"
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="current-password"
        required
      />
    </div>
  )
}

export default LoginPassword
