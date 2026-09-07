import TextConfig from "../../../../libs/configs/site/text.configs.ts"

function LoginButtons() {
  return (
    <div className="buttons-auth">
      <button type="submit">{TextConfig.doLogin}</button>
    </div>
  )
}

export default LoginButtons
