import { Route, Routes } from 'react-router-dom'
import { lazy } from 'react'


{/* Main Page */}
import App from './pages/App.tsx'

const Login = lazy(() => import('./pages/Login.tsx'))
const Register = lazy(() => import('./pages/Register.tsx'))
const Gallery = lazy(() => import('./pages/Gallery.tsx'))



function Router() {
    return (
        <>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/gallery" element={<Gallery />} />
            </Routes>
        </>
    )
}
export default Router