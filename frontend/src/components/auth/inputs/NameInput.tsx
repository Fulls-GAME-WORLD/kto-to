import TextConfig from "../../../libs/configs/site/text.configs.ts"

interface NameInputProps {
  value: string
  onChange: (value: string) => void
}

function NameInput({ value, onChange }: NameInputProps) {
  return (
    <div className="form-item-name">
      <label htmlFor="name">{TextConfig.name}</label>
      <input
        id="name"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="name"
        required
      />
    </div>
  )
}

export default NameInput
