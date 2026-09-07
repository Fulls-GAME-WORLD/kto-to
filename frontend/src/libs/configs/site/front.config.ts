import { getCurrentLanguage } from "../../i18n/i18n"

const currentLang = getCurrentLanguage()
const langDicts = import.meta.glob<Record<string, string>>("../../meta/*.json", { eager: true })
const langDict = langDicts[`../../meta/${currentLang}.json`];

function frontConfig() {
    return {
        title: langDict.title,
        url: 'https://ads.analogwakatime.com',
        baseUrl: '/',
    }
}

export default frontConfig()