import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  User,
  Shield,
  Building,
  Key,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Layers,
  Code2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'

export const Route = createFileRoute('/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const { user, bundle, isLoading, isInitialized, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showJson, setShowJson] = useState(false)

  // Auth Guard: Redirect unauthenticated users
  useEffect(() => {
    if (isInitialized && !user && !isLoading) {
      navigate({ to: '/login' })
    }
  }, [user, isInitialized, isLoading, navigate])

  const handleLogout = async () => {
    await logout()
    navigate({ to: '/login' })
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshUser()
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading || !isInitialized) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-600">Loading your HAUZ profile & records...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Authenticated Session Active
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            HAUZ Account Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Connected Appwrite Identity and HAUZ Relational Schema Records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </button>
        </div>
      </div>

      {/* Warning if unverified */}
      {!user.emailVerification && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h3 className="font-bold">Email Verification Incomplete</h3>
            <p className="text-amber-700 mt-1">
              Your Appwrite Auth email has not been verified yet. Please check your inbox or visit the{' '}
              <Link to="/verify" className="font-bold underline text-amber-900">
                verification page
              </Link>{' '}
              to complete your registration.
            </p>
          </div>
        </div>
      )}

      {/* Warning if verified but HAUZ records missing */}
      {user.emailVerification && !bundle?.hasHauzRecords && (
        <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 flex items-start gap-3 shadow-sm">
          <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <h3 className="font-bold">HAUZ Provisioning Pending</h3>
            <p className="text-blue-700 mt-1">
              Your email is verified. Click "Refresh Data" or navigate to{' '}
              <Link to="/verify" className="font-bold underline text-blue-900">
                Verify
              </Link>{' '}
              to trigger HAUZ schema creation.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Data Model Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Appwrite Auth User Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Key className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-900 text-base">Appwrite Auth User</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              External Identity
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-mono uppercase block text-[10px]">Appwrite User ID ($id)</span>
              <span className="font-mono text-slate-800 font-medium bg-slate-100 px-2 py-1 rounded mt-0.5 block truncate">
                {user.$id}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-mono uppercase block text-[10px]">Full Name</span>
                <span className="text-slate-800 font-semibold">{user.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono uppercase block text-[10px]">Email Status</span>
                {user.emailVerification ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-700 font-bold flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Unverified
                  </span>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-mono uppercase block text-[10px]">Email Address</span>
              <span className="text-slate-800 font-medium">{user.email}</span>
            </div>

            <div>
              <span className="text-slate-400 font-mono uppercase block text-[10px]">Account Created At</span>
              <span className="text-slate-600 font-mono">{new Date(user.$createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* 2. HAUZ Account Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                <Building className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-900 text-base">HAUZ Account (`accounts`)</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {bundle?.account?.status?.toUpperCase() || 'NO RECORD'}
            </span>
          </div>

          {bundle?.account ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-mono uppercase block text-[10px]">Account ID ($id)</span>
                <span className="font-mono text-slate-800 font-medium bg-slate-100 px-2 py-1 rounded mt-0.5 block truncate">
                  {bundle.account.$id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-mono uppercase block text-[10px]">Account Type</span>
                  <span className="text-slate-800 font-semibold capitalize">{bundle.account.account_type}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase block text-[10px]">Status</span>
                  <span className="text-emerald-700 font-bold capitalize">{bundle.account.status}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-mono uppercase block text-[10px]">
                  Current Access Grant ID
                </span>
                <span className="font-mono text-slate-800 font-medium bg-slate-100 px-2 py-1 rounded mt-0.5 block truncate">
                  {bundle.account.current_access_grant_id || 'None'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-mono uppercase block text-[10px]">Terminated At</span>
                <span className="text-slate-600 font-mono">
                  {bundle.account.terminated_at ? new Date(bundle.account.terminated_at).toLocaleString() : 'null (Active)'}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No HAUZ Account record created yet.
            </div>
          )}
        </div>

        {/* 3. Personal Account Profile Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <User className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-900 text-base">Personal Account (`personal_accounts`)</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Profile
            </span>
          </div>

          {bundle?.personalAccount ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-mono uppercase block text-[10px]">Personal Account ID ($id)</span>
                <span className="font-mono text-slate-800 font-medium bg-slate-100 px-2 py-1 rounded mt-0.5 block truncate">
                  {bundle.personalAccount.$id}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400 font-mono uppercase block text-[10px]">First Name</span>
                  <span className="text-slate-800 font-bold text-sm">{bundle.personalAccount.first_name}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-mono uppercase block text-[10px]">Last Name</span>
                  <span className="text-slate-800 font-bold text-sm">{bundle.personalAccount.last_name}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 font-mono uppercase block text-[10px]">Contact Phone</span>
                <span className="text-slate-800 font-semibold">
                  {bundle.personalAccount.contact_phone || 'None provided'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-mono uppercase block text-[10px]">Account ID Pointer</span>
                <span className="font-mono text-slate-600 truncate block">
                  {typeof bundle.personalAccount.account_id === 'object'
                    ? (bundle.personalAccount.account_id as any)?.$id
                    : bundle.personalAccount.account_id}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No Personal Account profile created yet.
            </div>
          )}
        </div>

        {/* 4. Personal Role Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Shield className="w-4 h-4" />
              </div>
              <h2 className="font-bold text-slate-900 text-base">Personal Role (`personal_roles`)</h2>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
              {bundle?.personalRole?.value || 'N/A'}
            </span>
          </div>

          {bundle?.personalRole ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-mono uppercase block text-[10px]">Role Document ID ($id)</span>
                <span className="font-mono text-slate-800 font-medium bg-slate-100 px-2 py-1 rounded mt-0.5 block truncate">
                  {bundle.personalRole.$id}
                </span>
              </div>

              <div>
                <span className="text-slate-400 font-mono uppercase block text-[10px]">Role Value</span>
                <span className="text-lg font-extrabold text-blue-700 capitalize mt-0.5 block">
                  {bundle.personalRole.value}
                </span>
              </div>

              <p className="text-slate-500 leading-relaxed text-xs">
                {bundle.personalRole.value === 'consumer'
                  ? 'Consumer role: allows searching, saving properties, and individual interaction.'
                  : 'Realtor role: allows property listings, management, and agency operations.'}
              </p>
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400">
              No Role record connected.
            </div>
          )}
        </div>
      </div>

      {/* 5. Account Access Grants History Table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Account Access Grants (`account_access_grants`)</h2>
              <p className="text-xs text-slate-500">
                Grants connecting identity ({user.$id}) to HAUZ Account
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Total: {bundle?.allGrants?.length || 0}
          </span>
        </div>

        {bundle?.allGrants && bundle.allGrants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="py-2.5 px-3">Grant ID ($id)</th>
                  <th className="py-2.5 px-3">Appwrite User ID</th>
                  <th className="py-2.5 px-3">HAUZ Account ID</th>
                  <th className="py-2.5 px-3">Revoked At</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {bundle.allGrants.map((grant) => {
                  const accId =
                    typeof grant.account_id === 'object'
                      ? (grant.account_id as any)?.$id
                      : grant.account_id
                  const isCurrent = bundle?.account?.current_access_grant_id === grant.$id

                  return (
                    <tr key={grant.$id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{grant.$id}</td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]">{grant.appwrite_user_id}</td>
                      <td className="py-2.5 px-3 text-slate-600 truncate max-w-[140px]">{accId}</td>
                      <td className="py-2.5 px-3 text-slate-500">
                        {grant.revoked_at ? new Date(grant.revoked_at).toLocaleString() : 'null'}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {isCurrent ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            CURRENT ACTIVE
                          </span>
                        ) : grant.revoked_at ? (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                            REVOKED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[10px]">
                            VALID
                          </span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            No access grants recorded.
          </div>
        )}
      </div>

      {/* 6. Raw JSON Inspector for Verification */}
      <div className="bg-slate-900 text-slate-100 p-6 rounded-3xl shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm">Raw Appwrite Schema Documents Inspector</h3>
          </div>
          <button
            onClick={() => setShowJson(!showJson)}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-blue-300 rounded-lg text-xs font-mono transition-colors"
          >
            {showJson ? 'Hide JSON [-]' : 'Inspect Full JSON [+]'}
          </button>
        </div>

        {showJson && (
          <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto max-h-96 border border-slate-800">
            {JSON.stringify(
              {
                authAccount: user,
                hauzAccount: bundle?.account,
                personalAccount: bundle?.personalAccount,
                personalRole: bundle?.personalRole,
                currentGrant: bundle?.currentGrant,
                allGrants: bundle?.allGrants,
              },
              null,
              2
            )}
          </pre>
        )}
      </div>
    </div>
  )
}
