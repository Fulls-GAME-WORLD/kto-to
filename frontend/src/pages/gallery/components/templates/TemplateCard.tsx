import type { PosterTemplate } from "../../../../libs/templates/templates.ts"
import TextConfig from "../../../../libs/configs/site/text.configs.ts"

interface TemplateCardProps {
  template: PosterTemplate
  onUseTemplate: () => void
}

function TemplateCard({ template, onUseTemplate }: TemplateCardProps) {
  return (
    <article className="poster-card">
      <div className="poster-card-preview">
        <span className="poster-card-format">{template.format}</span>
      </div>
      <div className="poster-card-body">
        <h3>{template.name}</h3>
        <p>{template.format}</p>
        <div className="poster-card-actions">
          <button onClick={onUseTemplate}>{TextConfig.clone}</button>
        </div>
      </div>
    </article>
  )
}

export default TemplateCard
