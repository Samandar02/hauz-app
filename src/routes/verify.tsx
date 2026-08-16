import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  CheckCircle2,
  AlertCircle,
  Mail,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
  Key,
} from 'lucide-react'

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
  const { user, bundle, completeVerification, resendVerification, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  // Manual input state for testing
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
        err?.message || 'Email verification or HAUZ record creation failed. Please check the link or request a new one.'
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

  // 1. Verifying State
  if (status === 'verifying') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Verifying Email & Provisioning HAUZ Records...</h2>
          <p className="text-sm text-slate-500">
            Validating security secret and building accounts, grants, and personal profile in Appwrite database.
          </p>
        </div>
      </div>
    )
  }

  // 2. Success State
  if (status === 'success' || (user?.emailVerification && bundle?.hasHauzRecords)) {
    return (
      <div className="max-w-lg mx-auto px-4 py-14">
        <div className="bg-white p-8 rounded-3xl border border-emerald-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Registration & Verification Complete!
            </h2>
            <p className="text-sm text-slate-600">
              Your email has been verified and your HAUZ account has been successfully provisioned.
            </p>
          </div>

          {/* Provisioned Records Summary */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-bold text-slate-700">
              <span>Created HAUZ Records</span>
              <span className="text-emerald-600 font-mono">STATUS: ACTIVE</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Account Type:</span>
              <span className="font-semibold text-slate-900 capitalize">{bundle?.account?.account_type || 'individual'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Personal Role:</span>
              <span className="font-bold text-blue-600 capitalize">{bundle?.personalRole?.value || 'consumer'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Account ID:</span>
              <span className="font-mono text-slate-700 text-[11px] truncate max-w-[180px]">
                {bundle?.account?.$id || 'Generated UUID'}
              </span>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            Open Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    )
  }

  // 3. Error State
  if (status === 'error') {
    return (
      <div className="max-w-lg mx-auto px-4 py-14">
        <div className="bg-white p-8 rounded-3xl border border-red-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Verification Failed
            </h2>
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-xl border border-red-100">
              {errorMessage || 'The verification link may have expired or is invalid.'}
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {user && (
              <button
                onClick={handleResend}
                disabled={resendStatus === 'sending'}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                {resendStatus === 'sending' ? 'Sending...' : 'Request New Link'}
              </button>
            )}
            <Link
              to="/login"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // 4. Default / Pending Verification View
  return (
    <div className="max-w-xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
          <Mail className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">
            Email Verification Status
          </h2>
          <p className="text-sm text-slate-600">
            {user ? (
              <>
                Signed in as <strong className="text-slate-900">{user.email}</strong>.
                {user.emailVerification ? (
                  <span className="block text-emerald-600 font-semibold mt-1">Your email is verified.</span>
                ) : (
                  <span className="block text-amber-600 font-semibold mt-1">Verification link is pending.</span>
                )}
              </>
            ) : (
              'Please open the verification link sent to your email address.'
            )}
          </p>
        </div>

        {user && !user.emailVerification && (
          <div className="pt-2">
            <button
              onClick={handleResend}
              disabled={resendStatus === 'sending'}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {resendStatus === 'sending'
                ? 'Sending...'
                : resendStatus === 'sent'
                ? 'Verification Email Sent ✅'
                : 'Send Verification Email'}
            </button>
          </div>
        )}
      </div>

      {/* Manual Token Verification (For Development & Testing) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Key className="w-4 h-4 text-blue-600" />
          <span>Manual Token Entry (Development & Testing)</span>
        </div>
        <p className="text-xs text-slate-500">
          If you are testing locally or have a manual Appwrite verification URL, enter the parameters below:
        </p>

        <form onSubmit={handleManualSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">User ID</label>
            <input
              type="text"
              value={manualUserId}
              onChange={(e) => setManualUserId(e.target.value)}
              placeholder="e.g. 64a8b..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Secret</label>
            <input
              type="text"
              value={manualSecret}
              onChange={(e) => setManualSecret(e.target.value)}
              placeholder="e.g. 9b8c..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Execute Verification
          </button>
        </form>
      </div>
    </div>
  )
}
