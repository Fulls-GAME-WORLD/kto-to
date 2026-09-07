import { Route, Routes } from 'react-router-dom'
import { lazy } from 'react'


{/* Main Page */}
import App from './pages/main/App.tsx'

{/* Auth Pages */}
const Login = lazy(() => import('./pages/auth/Login.tsx'))
const Register = lazy(() => import('./pages/auth/Register.tsx'))

{/* Gallery */}
const Gallery = lazy(() => import('./pages/gallery/Gallery.tsx'))



function Router() {
    return (
        <>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/start/auth/login" element={<Login />} />
                <Route path="/start/auth/register" element={<Register />} />
                <Route path="/my/gallery" element={<Gallery />} />
            </Routes>
        </>
    )
}
export default Router
