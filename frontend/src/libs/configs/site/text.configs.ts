import { getCurrentLanguage } from "../../i18n/i18n"

const currentLang = getCurrentLanguage()
const langDicts = import.meta.glob<Record<string, string>>("../../meta/*.json", { eager: true })
const langDict = langDicts[`../../meta/${currentLang}.json`];

function TextConfig() {
    return {
        hi: langDict.hi,
    }
}
export default TextConfig()