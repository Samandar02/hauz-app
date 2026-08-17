import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { user, isLoading } = useAuth()

  return (
    <div className="max-w-xl mx-auto py-12 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">HAUZ Authentication</h1>
      <p className="text-sm text-gray-600 mb-6">
        Personal Account registration and authentication with email verification.
      </p>

      {isLoading ? (
        <p className="text-sm text-gray-500">Checking session...</p>
      ) : user ? (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <p className="text-sm text-gray-700">
            You are signed in as <strong className="text-gray-900">{user.email}</strong>.
          </p>
          <Link
            to="/dashboard"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded text-sm"
          >
            Go to Dashboard
          </Link>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center gap-4">
          <Link
            to="/login"
            className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm font-medium text-white"
          >
            Register
          </Link>
        </div>
      )}
    </div>
  )
}

