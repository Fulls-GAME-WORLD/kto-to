import TextConfig from "../../../libs/configs/site/text.configs.ts"

interface EmailInputProps {
  value: string
  onChange: (value: string) => void
}

function EmailInput({ value, onChange }: EmailInputProps) {
  return (
    <div className="form-item-email">
      <label htmlFor="email">{TextConfig.email}</label>
      <input
        id="email"
        type="email"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="email"
        required
      />
    </div>
  )
}

export default EmailInput
