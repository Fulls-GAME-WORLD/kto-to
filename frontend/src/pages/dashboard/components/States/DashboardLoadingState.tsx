function DashboardLoadingState() {
  return (
    <div className="dashboard-loading">
      <div className="skeleton" style={{ height: 28, width: 220 }} />
      <div className="skeleton" style={{ height: 14, width: 320, marginTop: 8 }} />
      <div className="skeleton-row" style={{ marginTop: 20 }}>
        <div className="skeleton" style={{ height: 110, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 110, borderRadius: 16 }} />
        <div className="skeleton" style={{ height: 110, borderRadius: 16 }} />
      </div>
      <div className="skeleton" style={{ height: 40, width: 200, borderRadius: 999, marginTop: 8 }} />
    </div>
  )
}

export default DashboardLoadingState
