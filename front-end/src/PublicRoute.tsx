import { Navigate } from 'react-router-dom'
import { useAuth } from './components/AuthProvider'
import { ReactNode } from 'react'

interface PublicRouteProps {   //defines types of props expected by the public route component
  children: ReactNode          //expects one prop called children => useful to wrap dashboard and such pages
}

export default function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated } = useAuth()   //const isAuth is seth to the value of useAuth which authenthicates for us

  if (isAuthenticated) { // authenthicated => straight to dashboard
    return <Navigate to="/todolist" replace />;
  }

  return <>    
  {children}   
  </>
}
