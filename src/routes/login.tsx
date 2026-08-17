import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Mail,
  Lock,
  LogIn,
  AlertCircle,
  ShieldCheck,
  Send,
  Loader2,
  AlertTriangle,
} from 'lucide-react'

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

  // Redirect if already logged in and verified
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
      setError('Please enter your email address.')
      return
    }

    if (!password) {
      setError('Please enter your password.')
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
      const msg = err?.message || 'Invalid email or password. Please check your credentials.'
      setError(msg)
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
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            HAUZ Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Sign In to HAUZ
          </h1>
          <p className="text-sm text-slate-500">
            Enter your credentials to access your personal account.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block">Authentication Error</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Unverified Email Warning Banner */}
        {unverifiedState && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-amber-900 block">Email Verification Required</strong>
                <p className="mt-0.5 text-amber-700">
                  Your account was found, but your email has not been verified yet. HAUZ records will be active upon verification.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendStatus === 'sending'}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3 h-3" />
                {resendStatus === 'sending' ? 'Sending...' : 'Resend Link'}
              </button>
              <Link
                to="/verify"
                className="px-3 py-1.5 bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 rounded-lg font-semibold text-xs transition-colors"
              >
                Open Verification
              </Link>
            </div>
            {resendStatus === 'sent' && (
              <p className="text-emerald-700 font-medium">Verification link sent to your email!</p>
            )}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm transition-colors focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-sm transition-colors focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-100">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-blue-600 hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  )
}
