import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { listTemplates, cloneTemplate, type PosterTemplate } from "../../libs/templates/templates.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"

function TemplateList() {
  const navigate = useNavigate()
  const [templates, setTemplates] = useState<PosterTemplate[]>([])

  useEffect(() => {
    listTemplates()
      .then(setTemplates)
      .catch(() => setTemplates([]))
  }, [])

  async function use(id: number) {
    const poster = await cloneTemplate(id)
    navigate(`/editor/${poster.id}`)
  }

  return (
    <section className="template-list">
      <h2>{TextConfig.templates}</h2>
      <div className="poster-grid">
        {templates.map((tpl) => (
          <article key={tpl.id} className="poster-card">
            <h3>{tpl.name}</h3>
            <p>{tpl.format}</p>
            <button onClick={() => use(tpl.id)}>{TextConfig.clone}</button>
          </article>
        ))}
      </div>
    </section>
  )
}

export default TemplateList
