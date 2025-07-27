import { HashRouter, Routes, Route, Navigate} from 'react-router-dom'
import LogIn from './pages/LogIn'
import AllTasks from './pages/AllTasks'
import TodoList from './pages/todolist'
import AllUsers from './pages/AllUsers'
import NoPage from './pages/NoPage'
import { AuthProvider } from './components/AuthProvider'
import PrivateRoute from './PrivateRoute'
import PublicRoute from './PublicRoute'
import ReviewsList from './pages/ReviewsList'
import Register from './pages/Register'
import Admin from './pages/Admin'


export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes> 
          <Route path="/" element={<Navigate to="/login" replace />} />  {/*when the root of the app is visited we go to login page*/}

          <Route path="/login" element={
            <PublicRoute>   {/* only login is public as it has to be accessible by everyone */}
              <LogIn />
            </PublicRoute>
          } />
          <Route path="/todolist" element={
            <PrivateRoute>
              <TodoList />
            </PrivateRoute>
          } />

          <Route path="/reviewsList" element={
            <PrivateRoute>
              <ReviewsList />
            </PrivateRoute>
          } />

          <Route path="/register" element={
                      <PublicRoute>
                        <Register />
                      </PublicRoute>
          } />

          <Route path="/allTasks" element={
                    <PrivateRoute>
                        <AllTasks/>
                    </PrivateRoute>
          } />

         <Route path="/allUsers" element={
                     <PrivateRoute>
                         <AllUsers/>
                     </PrivateRoute>
         } />

         <Route path="/Admin" element={
                              <PrivateRoute>
                                  <Admin/>
                              </PrivateRoute>
                  } />
          <Route path="*" element={<NoPage />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}