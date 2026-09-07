function ProfileLoadingState() {
  return (
    <div className="profile-skeleton">
      <div className="skeleton" style={{ width: 64, height: 64, borderRadius: "50%" }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <div className="skeleton" style={{ height: 20, width: 160 }} />
        <div className="skeleton" style={{ height: 14, width: 220 }} />
        <div className="skeleton" style={{ height: 12, width: 140 }} />
      </div>
    </div>
  )
}

export default ProfileLoadingState
