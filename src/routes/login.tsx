import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const { login, user, bundle, resendVerification } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unverifiedState, setUnverifiedState] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  useEffect(() => {
    if (user && user.emailVerification && bundle?.hasHauzRecords) {
      navigate({ to: '/dashboard' })
    }
  }, [user, bundle, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setUnverifiedState(false)

    if (!email.trim()) {
      setError('Email is required.')
      return
    }

    if (!password) {
      setError('Password is required.')
      return
    }

    setIsSubmitting(true)
    try {
      const refreshedBundle = await login(email.trim(), password)

      if (!refreshedBundle.isVerified) {
        setUnverifiedState(true)
      } else {
        navigate({ to: '/dashboard' })
      }
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err?.message || 'Invalid email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResendStatus('sending')
    try {
      await resendVerification()
      setResendStatus('sent')
    } catch (err: any) {
      setResendStatus('error')
      setError(err?.message || 'Failed to resend verification email.')
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Login</h1>
      <p className="text-xs text-gray-500 mb-6">Sign in with your email and password.</p>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {unverifiedState && (
        <div className="mb-4 p-3 rounded bg-amber-50 border border-amber-200 text-xs text-amber-800 space-y-2">
          <p className="font-semibold">Email Verification Required</p>
          <p>Your email has not been verified yet. Please check your inbox or resend the verification link.</p>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleResend}
              disabled={resendStatus === 'sending'}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-medium"
            >
              {resendStatus === 'sending' ? 'Sending...' : 'Resend Verification Link'}
            </button>
            <Link
              to="/verify"
              className="px-2.5 py-1 bg-white border border-amber-300 text-amber-800 rounded text-xs hover:bg-amber-100"
            >
              Go to Verify Page
            </Link>
          </div>
          {resendStatus === 'sent' && <p className="text-emerald-700 font-medium">Verification link sent!</p>}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors disabled:opacity-60"
        >
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="text-xs text-center text-gray-500 mt-4">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">
          Register
        </Link>
      </p>
    </div>
  )
}

