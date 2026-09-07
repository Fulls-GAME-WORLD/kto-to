import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listTemplates, cloneTemplate, type PosterTemplate } from "../../../../libs/templates/templates.ts"
import TemplateCard from "./TemplateCard.tsx"

function TemplateCardSkeleton() {
  return (
    <div className="poster-card poster-card-skeleton">
      <div className="skeleton skeleton-preview" />
      <div className="skeleton-body">
        <div className="skeleton" style={{ height: 16, width: "60%" }} />
        <div className="skeleton" style={{ height: 12, width: "30%" }} />
        <div className="skeleton" style={{ height: 36, width: "100%", marginTop: 8 }} />
      </div>
    </div>
  )
}

function TemplateList() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<PosterTemplate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]))
      .finally(() => setLoading(false))
  }, [])

  async function cloneTemplateById(id: number) {
    const poster = await cloneTemplate(id)
    navigate(`/my/poster/${poster.id}`)
  }

  if (loading) {
    return (
      <section className="template-list">
        <div className="poster-grid">
          <TemplateCardSkeleton />
          <TemplateCardSkeleton />
          <TemplateCardSkeleton />
          <TemplateCardSkeleton />
        </div>
      </section>
    )
  }

  return (
    <section className="template-list">
      <div className="poster-grid">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} onUseTemplate={() => cloneTemplateById(template.id)} />
        ))}
      </div>
    </section>
  )
}

export default TemplateList
