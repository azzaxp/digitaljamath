import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '@/lib/api'

interface ProtectedRouteProps {
    children: React.ReactNode
}

/**
 * Wrapper component that redirects to login if not authenticated.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const location = useLocation()

    if (!isAuthenticated()) {
        // Redirect to login, preserving the intended destination
        return <Navigate to="/auth/signin" state={{ from: location }} replace />
    }

    return <>{children}</>
}
