import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, bundle, isLoading, isInitialized, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (isInitialized && !user && !isLoading) {
      navigate({ to: '/login' })
    }
  }, [user, isInitialized, isLoading, navigate])

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login' })
  }

  if (isLoading || !isInitialized) {
    return (
      <div className="max-w-xl mx-auto text-center py-12 text-gray-500 text-sm">
        Loading authenticated account...
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Authenticated Dashboard</h1>
          <p className="text-xs text-gray-500">Welcome, {user.name || user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold"
        >
          Logout
        </button>
      </div>

      {/* Verification notice if not verified */}
      {!user.emailVerification && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
          <strong>Notice:</strong> Your email is not verified yet.{' '}
          <Link to="/verify" className="underline font-bold">
            Complete verification here
          </Link>
        </div>
      )}

      {/* Basic Account Information */}
      <div className="space-y-4 text-sm">
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Account Details</h2>

        <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50 p-4 rounded border border-gray-100">
          <div>
            <span className="text-gray-500 block">User Email:</span>
            <strong className="text-gray-900">{user.email}</strong>
          </div>
          <div>
            <span className="text-gray-500 block">Email Verification:</span>
            <span className={user.emailVerification ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
              {user.emailVerification ? 'Verified' : 'Unverified'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block">First Name:</span>
            <span className="text-gray-900 font-medium">{bundle?.personalAccount?.first_name || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Last Name:</span>
            <span className="text-gray-900 font-medium">{bundle?.personalAccount?.last_name || '-'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Personal Role:</span>
            <span className="text-blue-700 font-bold capitalize">{bundle?.personalRole?.value || 'consumer'}</span>
          </div>
          <div>
            <span className="text-gray-500 block">Contact Phone:</span>
            <span className="text-gray-900">{bundle?.personalAccount?.contact_phone || 'None provided'}</span>
          </div>
        </div>

        {/* HAUZ Database Records Summary */}
        <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider pt-2">HAUZ Database Schema Data</h2>
        <div className="text-xs bg-gray-50 p-4 rounded border border-gray-100 space-y-2 font-mono">
          <p>
            <span className="text-gray-500">accounts.$id:</span> {bundle?.account?.$id || 'N/A'}
          </p>
          <p>
            <span className="text-gray-500">accounts.status:</span> {bundle?.account?.status || 'N/A'}
          </p>
          <p>
            <span className="text-gray-500">accounts.account_type:</span> {bundle?.account?.account_type || 'individual'}
          </p>
          <p>
            <span className="text-gray-500">account_access_grants.$id:</span> {bundle?.currentGrant?.$id || 'N/A'}
          </p>
          <p>
            <span className="text-gray-500">personal_accounts.$id:</span> {bundle?.personalAccount?.$id || 'N/A'}
          </p>
        </div>
      </div>
    </div>
  )
}

