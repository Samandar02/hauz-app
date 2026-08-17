import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import type { PersonalRoleValue } from '../types/hauz'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
})

function RegisterPage() {
  const { register, resendVerification } = useAuth()

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
      errs.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = 'Valid email is required'
    }

    if (!password) {
      errs.password = 'Password is required'
    } else if (password.length < 8) {
      errs.password = 'Password must be at least 8 characters'
    }

    if (contactPhone.trim()) {
      const e164Regex = /^\+?[1-9]\d{6,14}$/
      const cleaned = contactPhone.trim().replace(/[\s()-]/g, '')
      if (!e164Regex.test(cleaned) || contactPhone.trim().length > 20) {
        errs.contactPhone = 'Enter valid phone number (e.g. +14155552671)'
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
      setServerError(err?.message || 'Registration failed. Please try again.')
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

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Verify Your Email</h2>
        <p className="text-sm text-gray-600">
          A verification link has been sent to <strong>{email}</strong>. Please check your inbox to complete registration.
        </p>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={handleResend}
            disabled={resendStatus === 'sending'}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50"
          >
            {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Sent Again' : 'Resend Email'}
          </button>
          <Link
            to="/verify"
            className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded font-medium hover:bg-blue-700"
          >
            Go to Verification Page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Registration</h1>
      <p className="text-xs text-gray-500 mb-6">Create a personal HAUZ account.</p>

      {serverError && (
        <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">First Name *</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Last Name *</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
            />
            {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Password *</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">Personal Account Role *</label>
          <div className="flex items-center gap-6 mt-1 text-sm text-gray-700">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="consumer"
                checked={role === 'consumer'}
                onChange={() => setRole('consumer')}
                className="text-blue-600"
              />
              <span>Consumer</span>
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="realtor"
                checked={role === 'realtor'}
                onChange={() => setRole('realtor')}
                className="text-blue-600"
              />
              <span>Realtor</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1">
            Contact Phone <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="tel"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="+14155552671"
            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-blue-500"
          />
          {errors.contactPhone && <p className="text-xs text-red-600 mt-1">{errors.contactPhone}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium text-sm transition-colors disabled:opacity-60"
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p className="text-xs text-center text-gray-500 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:underline font-medium">
          Login
        </Link>
      </p>
    </div>
  )
}

