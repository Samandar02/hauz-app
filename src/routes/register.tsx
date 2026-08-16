import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { PersonalRoleValue } from '../types/hauz'
import {
  User,
  Mail,
  Lock,
  Phone,
  Building,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Send,
  Loader2,
} from 'lucide-react'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const { register, resendVerification, user } = useAuth()
  const navigate = useNavigate()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<PersonalRoleValue>('consumer')
  const [contactPhone, setContactPhone] = useState('')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [resendStatus, setResendStatus] = useState<string | null>(null)

  // Validation function
  const validate = () => {
    const errs: Record<string, string> = {}

    if (!firstName.trim()) {
      errs.firstName = 'First name is required'
    } else if (firstName.trim().length > 100) {
      errs.firstName = 'First name must be under 100 characters'
    }

    if (!lastName.trim()) {
      errs.lastName = 'Last name is required'
    } else if (lastName.trim().length > 100) {
      errs.lastName = 'Last name must be under 100 characters'
    }

    if (!email.trim()) {
      errs.email = 'Email address is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Please provide a valid email address'
    }

    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters long'
    }

    if (contactPhone.trim()) {
      // E.164 check: Optional '+' followed by 7-15 digits
      const e164Regex = /^\+?[1-9]\d{6,14}$/
      const cleaned = contactPhone.trim().replace(/[\s()-]/g, '')
      if (!e164Regex.test(cleaned) || contactPhone.trim().length > 20) {
        errs.contactPhone = 'Please enter a valid phone number (e.g. +14155552671)'
      }
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
        contactPhone: contactPhone.trim() || undefined,
      })
      setIsSuccess(true)
    } catch (err: any) {
      console.error('Registration error:', err)
      setServerError(
        err?.message || 'An error occurred during registration. Please verify your details and try again.'
      )
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
      setServerError(err?.message || 'Failed to resend verification email.')
    }
  }

  // If already successfully submitted, show verification instructions
  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Mail className="w-8 h-8 animate-bounce" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Verify Your Email Address
            </h2>
            <p className="text-sm text-slate-600">
              We have sent a verification link to{' '}
              <strong className="text-slate-900 font-semibold">{email}</strong>.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-left space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2 font-bold text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Next Step: Complete Registration
            </div>
            <p>
              1. Open your inbox and click the verification link in the email.
            </p>
            <p>
              2. Upon verification, your HAUZ Personal Account (<strong>{role}</strong>) will be created automatically.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleResend}
              disabled={resendStatus === 'sending'}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors inline-flex items-center justify-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              {resendStatus === 'sending'
                ? 'Resending...'
                : resendStatus === 'sent'
                ? 'Sent Again ✅'
                : 'Resend Verification Email'}
            </button>

            <Link
              to="/verify"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 shadow shadow-blue-600/20 transition-all inline-flex items-center justify-center gap-2"
            >
              Go to Verification Page
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {resendStatus === 'sent' && (
            <p className="text-xs text-emerald-600 font-medium">
              A new verification email has been dispatched.
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 sm:py-14">
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5" />
            HAUZ Personal Registration
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Create Your Account
          </h1>
          <p className="text-sm text-slate-500">
            Register as a <strong>Consumer</strong> or <strong>Realtor</strong> to access HAUZ.
          </p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <strong className="font-semibold block">Registration Failed</strong>
              <span>{serverError}</span>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={100}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.firstName ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.firstName && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={100}
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.lastName ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-500'
                  }`}
                />
              </div>
              {errors.lastName && (
                <p className="text-xs text-red-600 mt-1 font-medium">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.password}</p>
            )}
          </div>

          {/* Personal Role Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Personal Account Role <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Consumer Role Option */}
              <button
                type="button"
                onClick={() => setRole('consumer')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  role === 'consumer'
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Consumer</span>
                  {role === 'consumer' ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Looking to buy, rent, or manage your personal properties.
                </p>
              </button>

              {/* Realtor Role Option */}
              <button
                type="button"
                onClick={() => setRole('realtor')}
                className={`p-4 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                  role === 'realtor'
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-slate-900">Realtor</span>
                  {role === 'realtor' ? (
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-300" />
                  )}
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Licensed real estate agent or professional consultant.
                </p>
              </button>
            </div>
          </div>

          {/* Contact Phone (Optional) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Contact Phone
              </label>
              <span className="text-xs text-slate-400 font-medium">Optional (E.164)</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                maxLength={20}
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+14155552671"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.contactPhone ? 'border-red-400 bg-red-50/30' : 'border-slate-300 focus:border-blue-500'
                }`}
              />
            </div>
            {errors.contactPhone && (
              <p className="text-xs text-red-600 mt-1 font-medium">{errors.contactPhone}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Registering Account...
              </>
            ) : (
              <>
                Register & Verify Email
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-600 hover:underline">
            Log in here
          </Link>
        </p>
      </div>
    </div>
  )
}
