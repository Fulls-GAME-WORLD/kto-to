import { getCurrentLanguage } from "../../i18n/i18n"

const currentLang = getCurrentLanguage()
const langDicts = import.meta.glob<Record<string, string>>("../../meta/*.json", { eager: true })
const langDict = langDicts[`../../meta/${currentLang}.json`];

function TextConfig() {
    return {
        hi: langDict.hi,
        appName: langDict.appName,
        login: langDict.login,
        register: langDict.register,
        logout: langDict.logout,
        email: langDict.email,
        password: langDict.password,
        name: langDict.name,
        doLogin: langDict.doLogin,
        doRegister: langDict.doRegister,
        haveAccount: langDict.haveAccount,
        noAccount: langDict.noAccount,
        myPosters: langDict.myPosters,
        newPoster: langDict.newPoster,
        templates: langDict.templates,
        open: langDict.open,
        clone: langDict.clone,
        remove: langDict.remove,
        save: langDict.save,
        saved: langDict.saved,
        addText: langDict.addText,
        addRect: langDict.addRect,
        addCircle: langDict.addCircle,
        addImage: langDict.addImage,
        uploadImage: langDict.uploadImage,
        print: langDict.print,
        exportPng: langDict.exportPng,
        layers: langDict.layers,
        props: langDict.props,
        fill: langDict.fill,
        text: langDict.text,
        fontSize: langDict.fontSize,
        width: langDict.width,
        height: langDict.height,
        format: langDict.format,
        posterName: langDict.posterName,
        toFront: langDict.toFront,
        toBack: langDict.toBack,
        authRequired: langDict.authRequired,
        loading: langDict.loading,
    }
}
export default TextConfig()