import PosterLogo from "./Links/Logo.tsx"
import HomeLink from "./Links/HomeLink.tsx"
import GalleryLink from "./Links/GalleryLink.tsx"
import DashboardLink from "./Links/DashboardLink.tsx"
import ProfileLink from "./Links/ProfileLink.tsx"
import LoginLink from "./Links/LoginLink.tsx"
import RegisterLink from "./Links/RegisterLink.tsx"
import LogoutLink from "./Links/LogoutLink.tsx"
import { hasAuthToken } from "../../libs/auth/session.ts"

import "./menu.css"

function MainMenu() {
  const isAuthenticated = hasAuthToken()

  return (
    <header className="main-menu">
      <div className="menu-inner">
        <PosterLogo />
        <nav className="menu-nav">
          <HomeLink />
          {isAuthenticated ? (
            <>
              <DashboardLink />
              <GalleryLink />
              <ProfileLink />
              <LogoutLink />
            </>
          ) : (
            <>
              <LoginLink />
              <RegisterLink />
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

export default MainMenu
