import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface RegisterEmailProps {
  value: string
  onChange: (value: string) => void
}

function RegisterEmail({ value, onChange }: RegisterEmailProps) {
  return (
    <div className="form-item-email">
      <label htmlFor="register-email">{TextConfig.email}</label>
      <input
        id="register-email"
        type="email"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="email"
        required
      />
    </div>
  )
}

export default RegisterEmail
