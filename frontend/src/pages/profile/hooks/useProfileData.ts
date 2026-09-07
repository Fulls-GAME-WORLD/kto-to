import { useEffect, useState } from "react"
import { getProfileInfo, type ProfileInfo } from "../../libs/profile/profile-info.ts"

interface ProfileDataState {
  profile: ProfileInfo | null
  loading: boolean
  error: string
}

export function useProfileData() {
  const [state, setState] = useState<ProfileDataState>({ profile: null, loading: true, error: "" })

  useEffect(() => {
    getProfileInfo()
      .then((profile) => setState({ profile, loading: false, error: "" }))
      .catch((err: unknown) => setState({
        profile: null,
        loading: false,
        error: err instanceof Error ? err.message : "error",
      }))
  }, [])

  return state
}
