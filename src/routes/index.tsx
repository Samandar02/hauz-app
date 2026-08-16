import { createFileRoute, Link } from '@tanstack/react-router'
import { useAuth } from '../context/AuthContext'
import {
  Shield,
  Key,
  Users,
  Database,
  ArrowRight,
  CheckCircle,
  Building,
  UserCheck,
  Layers,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  const { user, bundle, isLoading } = useAuth()

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 sm:py-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-5">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          HAUZ Authentication Architecture
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
          Personal Account Registration & Auth System
        </h1>
        <p className="text-lg text-slate-600 leading-relaxed">
          Production-grade implementation connecting Appwrite Authentication with the HAUZ multi-entity relational schema for <strong>Consumer</strong> and <strong>Realtor</strong> accounts.
        </p>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
          {isLoading ? (
            <div className="h-11 w-48 bg-slate-200 animate-pulse rounded-xl" />
          ) : user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all hover:scale-[1.02]"
            >
              Open Authenticated Dashboard
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-all hover:scale-[1.02]"
              >
                Register New Account
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 font-semibold border border-slate-200 shadow-sm hover:bg-slate-50 transition-all"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* User Status Quick-Card if logged in */}
      {user && (
        <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-900/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">
                Current Session
              </span>
              <h3 className="text-xl font-bold mt-0.5">
                Logged in as {user.name} ({user.email})
              </h3>
              <p className="text-sm text-blue-100 mt-1">
                Role: <span className="font-semibold uppercase">{bundle?.personalRole?.value || 'Pending Setup'}</span> • Email Verification:{' '}
                {user.emailVerification ? '✅ Verified' : '⚠️ Pending Verification'}
              </p>
            </div>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-white text-blue-800 rounded-lg text-sm font-bold shadow hover:bg-blue-50 transition-colors"
            >
              View Full Schema Records &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Architecture Cards Grid */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1 */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
            <Key className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">Appwrite Auth User</h3>
          <p className="text-xs text-slate-500 font-mono mb-3">External Identity</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Owns email, credentials, and verification state. Connected via <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-blue-600">appwrite_user_id</code>.
          </p>
        </div>

        {/* Card 2 */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">account_access_grants</h3>
          <p className="text-xs text-slate-500 font-mono mb-3">Access Bridge</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Links the logged-in Appwrite user to HAUZ Accounts with revocation timestamp history.
          </p>
        </div>

        {/* Card 3 */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">accounts</h3>
          <p className="text-xs text-slate-500 font-mono mb-3">HAUZ Core Account</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Stores <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-slate-700">account_type: individual</code>, status, and active grant pointer.
          </p>
        </div>

        {/* Card 4 */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 text-base mb-1">personal_accounts</h3>
          <p className="text-xs text-slate-500 font-mono mb-3">Profile & Role Link</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            First name, last name, contact phone, linked to <code className="text-xs bg-slate-100 px-1 py-0.5 rounded text-emerald-700">personal_roles</code>.
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="mt-16 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Implemented Requirements</h2>
            <p className="text-sm text-slate-500">Strict adherence to HAUZ backend interview specification</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-slate-800">Email Verification Flow</p>
              <p className="text-slate-500 mt-0.5">Automated token verification and resend capability.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-slate-800">Atomic Rollback Protection</p>
              <p className="text-slate-500 mt-0.5">No partial or duplicate records on registration errors.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-slate-800">Consumer & Realtor Roles</p>
              <p className="text-slate-500 mt-0.5">Pre-seeded immutable UUID roles in personal_roles.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-slate-800">Session Persistence</p>
              <p className="text-slate-500 mt-0.5">Maintains auth state smoothly across page refreshes.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-slate-800">One-Click Setup Script</p>
              <p className="text-slate-500 mt-0.5">Automated database, indexes, and collection builder.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-semibold text-slate-800">Full Type Safety</p>
              <p className="text-slate-500 mt-0.5">Strict TypeScript schemas, TanStack Router routes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
