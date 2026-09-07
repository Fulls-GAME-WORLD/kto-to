import TextConfig from "../../../../../libs/configs/site/text.configs.ts"
import { SAMPLE_HTML } from "../constants/sample-html.ts"

interface CodeInputSectionProps {
  htmlCode: string
  onChange: (value: string) => void
}

function CodeInputSection({ htmlCode, onChange }: CodeInputSectionProps) {
  return (
    <div className="code-input-section">
      <div className="code-input-header">
        <span>{TextConfig.htmlSnippetLabel}</span>
        <button
          type="button"
          className="quick-fill-btn"
          onClick={() => onChange(SAMPLE_HTML)}
        >
          {TextConfig.loadSample}
        </button>
      </div>
      <textarea
        value={htmlCode}
        onChange={(e) => onChange(e.target.value)}
        placeholder="<div style='...'>...</div>"
        className="html-code-area"
        rows={10}
        spellCheck={false}
      />
    </div>
  )
}

export default CodeInputSection
