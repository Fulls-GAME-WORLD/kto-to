import { Link } from "react-router-dom"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"

function DashboardLinks() {
  return (
    <nav className="dashboard-links">
      <Link to="/my/gallery">{TextConfig.openGallery}</Link>
      <Link to="/my/profile">{TextConfig.navProfile}</Link>
    </nav>
  )
}

export default DashboardLinks
