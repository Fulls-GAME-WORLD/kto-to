import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listTemplates, cloneTemplate, type PosterTemplate } from "../../../../libs/templates/templates.ts"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"
import TemplateCard from "./TemplateCard.tsx"

function TemplateList() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<PosterTemplate[]>([])

  useEffect(() => {
    listTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]))
  }, [])

  async function cloneTemplateById(id: number) {
    const poster = await cloneTemplate(id)
    navigate(`/my/poster/${poster.id}`)
  }

  return (
    <section className="template-list">
      <h2>{TextConfig.templates}</h2>
      <div className="poster-grid">
        {templates.map((template) => (
          <TemplateCard key={template.id} template={template} onUseTemplate={() => cloneTemplateById(template.id)} />
        ))}
      </div>
    </section>
  )
}

export default TemplateList
