import MainMenu from "../../components/menu/MainMenu.tsx"
import { useProfileData } from "./hooks/useProfileData.ts"
import ProfileLoadingState from "./components/States/ProfileLoadingState.tsx"
import ProfileErrorAlert from "./components/States/ProfileErrorAlert.tsx"
import ProfileInfoCard from "./components/info/ProfileInfoCard.tsx"
import ProfileLogoutButton from "./components/buttons/ProfileLogoutButton.tsx"

import "./css/profile.modules.css"

function Profile() {
  const { profile, loading, error } = useProfileData()

  return (
    <>
      <MainMenu />
      <main className="main-pages">
        <div className="pages">
          {loading && <ProfileLoadingState />}
          {!loading && error !== "" && <ProfileErrorAlert message={error} />}
          {!loading && profile && (
            <>
              <ProfileInfoCard profile={profile} />
              <ProfileLogoutButton />
            </>
          )}
        </div>
      </main>
    </>
  )
}

export default Profile
