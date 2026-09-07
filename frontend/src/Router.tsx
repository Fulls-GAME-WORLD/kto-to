import { Route, Routes } from 'react-router-dom'
import { lazy } from 'react'


{/* Main Page */}
import App from './pages/App.tsx'



function Router() {
    return (
        <>
            <Routes>
                <Route path="/" element={<App />} />
            </Routes>
        </>
    )
}
export default Router