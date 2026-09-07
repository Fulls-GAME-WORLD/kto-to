import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface DashboardStatsProps {
  userName: string
  postersCount: number
  assetsCount: number
  templatesCount: number
}

function DashboardStats({ userName, postersCount, assetsCount, templatesCount }: DashboardStatsProps) {
  return (
    <section className="dashboard-stats">
      <h2>
        {TextConfig.welcomeBack}
        {userName !== "" ? `, ${userName}` : ""}
      </h2>
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat">
          <strong>{postersCount}</strong>
          <span>{TextConfig.statsPosters}</span>
        </div>
        <div className="dashboard-stat">
          <strong>{assetsCount}</strong>
          <span>{TextConfig.statsAssets}</span>
        </div>
        <div className="dashboard-stat">
          <strong>{templatesCount}</strong>
          <span>{TextConfig.statsTemplates}</span>
        </div>
      </div>
    </section>
  )
}

export default DashboardStats
