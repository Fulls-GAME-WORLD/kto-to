import TextConfig from "../..//libs/configs/site/text.configs"
import MainMenu from "../../components/menu/MainMenu"

function App() {
    return (
        <>
            <main className="main-pages">
                <MainMenu />
                <div className="pages">
                    <h1>{TextConfig.hi}</h1>
                </div>
            </main>
        </>
    )
}
export default App