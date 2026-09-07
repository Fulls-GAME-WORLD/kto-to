import type { ProfileInfo } from "../../../../libs/profile/profile-info.ts"

interface ProfileInfoCardProps {
  profile: ProfileInfo
}

function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
  return (
    <section className="profile-card">
      <h2>{profile.name}</h2>
      <p>{profile.email}</p>
    </section>
  )
}

export default ProfileInfoCard
