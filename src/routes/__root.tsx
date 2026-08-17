import { Outlet, createRootRoute, Link, useNavigate } from '@tanstack/react-router'
import { AuthProvider, useAuth } from '../context/AuthContext'
import '../styles.css'

export const Route = createRootRoute({
  component: RootLayout,
})

function NavigationBar() {
  const { user, logout, isLoading } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate({ to: '/login' })
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg text-gray-900 tracking-tight">
          HAUZ
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          {isLoading ? (
            <span className="text-gray-400 text-xs">Loading...</span>
          ) : user ? (
            <>
              <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 font-medium">
                Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500 text-xs">{user.email}</span>
              <button
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 text-xs font-semibold px-2 py-1 rounded border border-red-200 hover:bg-red-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-gray-900 font-medium">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded text-xs"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}

function RootComponent() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <NavigationBar />
      <main className="flex-1 py-8 px-4">
        <Outlet />
      </main>
      <footer className="border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        HAUZ Authentication • Personal Accounts
      </footer>
    </div>
  )
}

function RootLayout() {
  return (
    <AuthProvider>
      <RootComponent />
    </AuthProvider>
  )
}

