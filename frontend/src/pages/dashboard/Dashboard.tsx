import MainMenu from "../../components/menu/MainMenu.tsx"
import { useDashboardSummary } from "./hooks/useDashboardSummary.ts"
import DashboardStats from "./components/stats/DashboardStats.tsx"
import DashboardLinks from "./components/links/DashboardLinks.tsx"
import DashboardLoadingState from "./components/States/DashboardLoadingState.tsx"

import "./css/dashboard.modules.css"

function Dashboard() {
  const summary = useDashboardSummary()

  return (
    <>
      <MainMenu />
      <main className="main-pages">
        <div className="pages">
          {summary.loading ? (
            <DashboardLoadingState />
          ) : (
            <>
              <DashboardStats
                userName={summary.userName}
                postersCount={summary.postersCount}
                assetsCount={summary.assetsCount}
                templatesCount={summary.templatesCount}
              />
              <DashboardLinks />
            </>
          )}
        </div>
      </main>
    </>
  )
}

export default Dashboard
