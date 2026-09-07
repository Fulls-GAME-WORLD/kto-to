import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface RegisterNameProps {
  value: string
  onChange: (value: string) => void
}

function RegisterName({ value, onChange }: RegisterNameProps) {
  return (
    <div className="form-item-name">
      <label htmlFor="register-name">{TextConfig.name}</label>
      <input
        id="register-name"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="name"
        required
      />
    </div>
  )
}

export default RegisterName
