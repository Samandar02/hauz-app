import { Outlet, createRootRoute, Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { AuthProvider, useAuth } from '../context/AuthContext'
import {
  ShieldCheck,
  Building2,
  User,
  LogOut,
  LogIn,
  UserPlus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import '../styles.css'

export const Route = createRootRoute({
  component: RootLayout,
})

function NavigationBar() {
  const { user, bundle, logout, isLoading } = useAuth()
  const navigate = useNavigate()
  const routerState = useRouterState()
  const currentPath = routerState.location.pathname

  const handleLogout = async () => {
    try {
      await logout()
      navigate({ to: '/login' })
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2.5 font-black text-xl tracking-tight text-slate-900 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                HAUZ
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                to="/"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  currentPath === '/'
                    ? 'bg-blue-50 text-blue-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Overview
              </Link>
              {user && (
                <Link
                  to="/dashboard"
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPath === '/dashboard'
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {isLoading ? (
              <div className="w-24 h-8 bg-slate-100 animate-pulse rounded-lg" />
            ) : user ? (
              <div className="flex items-center gap-3">
                {/* User Status Badge */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-medium text-slate-700 border border-slate-200">
                  {user.emailVerification ? (
                    <span className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Verified
                    </span>
                  ) : (
                    <Link to="/verify" className="flex items-center gap-1 text-amber-700 hover:underline">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Unverified
                    </Link>
                  )}
                  {bundle?.personalRole && (
                    <>
                      <span className="text-slate-300">•</span>
                      <span className="capitalize px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[11px] font-bold">
                        {bundle.personalRole.value}
                      </span>
                    </>
                  )}
                </div>

                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-800 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="hidden sm:inline">
                    {user.name || user.email.split('@')[0]}
                  </span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg text-slate-600 hover:text-red-600 hover:bg-red-50 transition-colors border border-slate-200"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-4 h-4 text-slate-500" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg shadow-sm shadow-blue-600/20 transition-all hover:shadow"
                >
                  <UserPlus className="w-4 h-4" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>HAUZ Authentication System • Personal Accounts Exercise</span>
        </div>
        <p className="text-slate-400">
          Powered by Appwrite Auth, Database (TablesDB) & TanStack Router
        </p>
      </div>
    </footer>
  )
}

function RootComponent() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <NavigationBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
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
