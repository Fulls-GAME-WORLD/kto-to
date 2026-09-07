import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface RegisterPasswordProps {
  value: string
  onChange: (value: string) => void
}

function RegisterPassword({ value, onChange }: RegisterPasswordProps) {
  return (
    <div className="form-item-password">
      <label htmlFor="register-password">{TextConfig.password}</label>
      <input
        id="register-password"
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="new-password"
        required
      />
    </div>
  )
}

export default RegisterPassword
