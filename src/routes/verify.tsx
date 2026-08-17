import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'

interface VerifySearchParams {
  userId?: string
  secret?: string
}

export const Route = createFileRoute('/verify')({
  component: VerifyPage,
  validateSearch: (search: Record<string, unknown>): VerifySearchParams => {
    return {
      userId: typeof search.userId === 'string' ? search.userId : undefined,
      secret: typeof search.secret === 'string' ? search.secret : undefined,
    }
  },
})

function VerifyPage() {
  const { userId, secret } = Route.useSearch()
  const { user, bundle, completeVerification, resendVerification } = useAuth()

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  const [manualUserId, setManualUserId] = useState('')
  const [manualSecret, setManualSecret] = useState('')

  useEffect(() => {
    if (userId && secret && status === 'idle') {
      executeVerification(userId, secret)
    }
  }, [userId, secret])

  const executeVerification = async (uId: string, sec: string) => {
    setStatus('verifying')
    setErrorMessage(null)
    try {
      await completeVerification(uId, sec)
      setStatus('success')
    } catch (err: any) {
      console.error('Verification error:', err)
      setStatus('error')
      setErrorMessage(
        err?.message || 'Email verification failed. The link may have expired or already been used.'
      )
    }
  }

  const handleResend = async () => {
    setResendStatus('sending')
    try {
      await resendVerification()
      setResendStatus('sent')
    } catch (err: any) {
      setResendStatus('error')
      setErrorMessage(err?.message || 'Failed to resend verification email.')
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualUserId.trim() || !manualSecret.trim()) {
      setErrorMessage('Please enter both User ID and Secret.')
      return
    }
    executeVerification(manualUserId.trim(), manualSecret.trim())
  }

  if (status === 'verifying') {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm text-center">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Verifying Email...</h2>
        <p className="text-xs text-gray-500">Creating HAUZ accounts and personal profile records.</p>
      </div>
    )
  }

  if (status === 'success' || (user?.emailVerification && bundle?.hasHauzRecords)) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-lg font-bold text-emerald-700">Verification Complete</h2>
        <p className="text-sm text-gray-600">
          Your email has been verified and your HAUZ account has been created.
        </p>

        <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs space-y-1">
          <p><strong>Account Type:</strong> {bundle?.account?.account_type || 'individual'}</p>
          <p><strong>Role:</strong> {bundle?.personalRole?.value || 'consumer'}</p>
          <p><strong>Status:</strong> {bundle?.account?.status || 'active'}</p>
        </div>

        <Link
          to="/dashboard"
          className="block w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-center font-medium text-sm"
        >
          Open Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h1 className="text-xl font-bold text-gray-900">Email Verification</h1>
        {status === 'error' && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <p className="text-sm text-gray-600">
          {user ? (
            <>
              Current user: <strong>{user.email}</strong> ({user.emailVerification ? 'Verified' : 'Unverified'})
            </>
          ) : (
            'Please open the verification link sent to your email.'
          )}
        </p>

        {user && !user.emailVerification && (
          <button
            onClick={handleResend}
            disabled={resendStatus === 'sending'}
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors"
          >
            {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Sent Again' : 'Send Verification Email'}
          </button>
        )}
      </div>

      {/* Manual Entry for Local Testing */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm text-xs space-y-3">
        <h3 className="font-bold text-gray-800">Manual Verification (Local Testing)</h3>
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <div>
            <label className="block text-gray-600 mb-0.5">User ID</label>
            <input
              type="text"
              value={manualUserId}
              onChange={(e) => setManualUserId(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded font-mono"
            />
          </div>
          <div>
            <label className="block text-gray-600 mb-0.5">Secret</label>
            <input
              type="text"
              value={manualSecret}
              onChange={(e) => setManualSecret(e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-gray-800 hover:bg-gray-900 text-white rounded font-medium"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  )
}

