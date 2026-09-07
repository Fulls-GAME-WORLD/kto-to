import TextConfig from "../../../../libs/configs/site/text.configs.ts"

function RegisterButtons() {
  return (
    <div className="buttons-auth">
      <button type="submit">{TextConfig.doRegister}</button>
    </div>
  )
}

export default RegisterButtons
