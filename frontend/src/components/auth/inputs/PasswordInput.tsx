import TextConfig from "../../../libs/configs/site/text.configs.ts"

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
}

function PasswordInput({ value, onChange }: PasswordInputProps) {
  return (
    <div className="form-item-password">
      <label htmlFor="password">{TextConfig.password}</label>
      <input
        id="password"
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="current-password"
        required
      />
    </div>
  )
}

export default PasswordInput
