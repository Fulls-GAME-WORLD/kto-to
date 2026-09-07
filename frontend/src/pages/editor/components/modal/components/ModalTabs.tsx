import TextConfig from "../../../../../libs/configs/site/text.configs.ts"

interface ModalTabsProps {
  activeTab: "code" | "file"
  onTabChange: (tab: "code" | "file") => void
}

function ModalTabs({ activeTab, onTabChange }: ModalTabsProps) {
  return (
    <div className="modal-tabs">
      <button
        type="button"
        className={`tab-btn ${activeTab === "code" ? "active" : ""}`}
        onClick={() => onTabChange("code")}
      >
        {TextConfig.importTabCode}
      </button>
      <button
        type="button"
        className={`tab-btn ${activeTab === "file" ? "active" : ""}`}
        onClick={() => onTabChange("file")}
      >
        {TextConfig.importTabFile}
      </button>
    </div>
  )
}

export default ModalTabs
