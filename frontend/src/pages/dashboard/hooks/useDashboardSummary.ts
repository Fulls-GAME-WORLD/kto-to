import { useEffect, useState } from "react"
import { getProfileInfo } from "../../libs/profile/profile-info.ts"
import { listPosters } from "../../libs/posters/posters.ts"
import { listAssets } from "../../libs/assets/assets.ts"
import { listTemplates } from "../../libs/templates/templates.ts"

interface DashboardSummary {
  userName: string
  postersCount: number
  assetsCount: number
  templatesCount: number
  loading: boolean
}

export function useDashboardSummary() {
  const [summary, setSummary] = useState<DashboardSummary>({
    userName: "",
    postersCount: 0,
    assetsCount: 0,
    templatesCount: 0,
    loading: true,
  })

  useEffect(() => {
    Promise.allSettled([getProfileInfo(), listPosters(), listAssets(), listTemplates()]).then(
      ([profileResult, postersResult, assetsResult, templatesResult]) => {
        setSummary({
          userName:
            profileResult.status === "fulfilled" ? profileResult.value.name : "",
          postersCount:
            postersResult.status === "fulfilled" ? postersResult.value.length : 0,
          assetsCount:
            assetsResult.status === "fulfilled" ? assetsResult.value.length : 0,
          templatesCount:
            templatesResult.status === "fulfilled" ? templatesResult.value.length : 0,
          loading: false,
        })
      },
    )
  }, [])

  return summary
}
