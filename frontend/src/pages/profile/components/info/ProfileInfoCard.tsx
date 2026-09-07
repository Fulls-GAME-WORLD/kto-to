import type { ProfileInfo } from "../../../../libs/profile/profile-info.ts"

interface ProfileInfoCardProps {
  profile: ProfileInfo
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) {
    return "U"
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase()
  }
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

function ProfileInfoCard({ profile }: ProfileInfoCardProps) {
  return (
    <>
      <div className="profile-hero">
        <div className="profile-avatar">{getInitials(profile.name)}</div>
        <div className="profile-meta">
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
        </div>
      </div>
      <div className="profile-card">
        <div className="profile-row">
          <span>Name</span>
          <span>{profile.name}</span>
        </div>
        <div className="profile-row">
          <span>Email</span>
          <span>{profile.email}</span>
        </div>
        <div className="profile-row">
          <span>UUID</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{profile.uuid}</span>
        </div>
      </div>
    </>
  )
}

export default ProfileInfoCard
