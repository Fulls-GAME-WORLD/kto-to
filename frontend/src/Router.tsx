import { Route, Routes } from 'react-router-dom'
import { lazy } from 'react'


{/* Main Page */}
import App from './pages/main/App.tsx'

{/* Auth Pages */}
const Login = lazy(() => import('./pages/auth/Login.tsx'))
const Register = lazy(() => import('./pages/auth/Register.tsx'))

{/* Gallery */}
const Gallery = lazy(() => import('./pages/gallery/Gallery.tsx'))

{/* Dashboard */}
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard.tsx'))

{/* Profile */}
const Profile = lazy(() => import('./pages/profile/Profile.tsx'))

{/* Editor */}
const Editor = lazy(() => import('./pages/editor/Editor.tsx'))



function Router() {
    return (
        <>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/start/auth/login" element={<Login />} />
                <Route path="/start/auth/register" element={<Register />} />
                <Route path="/my/gallery" element={<Gallery />} />
                <Route path="/my/dashboard" element={<Dashboard />} />
                <Route path="/my/profile" element={<Profile />} />
                <Route path="/my/poster/:posterId" element={<Editor />} />
            </Routes>
        </>
    )
}
export default Router
