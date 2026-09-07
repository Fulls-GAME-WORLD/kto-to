import { Link } from "react-router-dom"
import TextConfig from "../../libs/configs/site/text.configs.ts"

function PosterLogo() {
  return (
    <Link to="/" className="menu-logo">
      {TextConfig.appName}
    </Link>
  )
}

export default PosterLogo
