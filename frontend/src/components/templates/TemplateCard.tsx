import type { PosterTemplate } from "../../libs/templates/templates.ts"
import TextConfig from "../../libs/configs/site/text.configs.ts"

interface TemplateCardProps {
  template: PosterTemplate
  onUse: () => void
}

function TemplateCard({ template, onUse }: TemplateCardProps) {
  return (
    <article className="poster-card">
      <h3>{template.name}</h3>
      <p>{template.format}</p>
      <button onClick={onUse}>{TextConfig.clone}</button>
    </article>
  )
}

export default TemplateCard
