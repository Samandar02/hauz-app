import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { account, ID } from '../lib/appwrite'
import { getHauzUserBundle, provisionHauzRecords } from '../lib/hauzService'
import type { Models } from 'appwrite'
import type { HauzUserBundle, RegisterFormData, PersonalRoleValue } from '../types/hauz'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  bundle: HauzUserBundle | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, pass: string) => Promise<HauzUserBundle>
  register: (data: RegisterFormData) => Promise<{ user: Models.User<Models.Preferences> }>
  logout: () => Promise<void>
  resendVerification: () => Promise<void>
  completeVerification: (userId: string, secret: string) => Promise<HauzUserBundle>
  refreshUser: () => Promise<HauzUserBundle | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [bundle, setBundle] = useState<HauzUserBundle | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  const refreshUser = useCallback(async (): Promise<HauzUserBundle | null> => {
    try {
      const authUser = await account.get()
      setUser(authUser)

      const userBundle = await getHauzUserBundle(authUser)
      setBundle(userBundle)

      // If user is verified but HAUZ records aren't provisioned yet, provision them now
      if (authUser.emailVerification && !userBundle.hasHauzRecords && authUser.prefs?.role) {
        try {
          await provisionHauzRecords({
            userId: authUser.$id,
            firstName: authUser.prefs.firstName || authUser.name.split(' ')[0] || 'User',
            lastName: authUser.prefs.lastName || authUser.name.split(' ').slice(1).join(' ') || '',
            role: (authUser.prefs.role as PersonalRoleValue) || 'consumer',
            contactPhone: authUser.prefs.contactPhone || null,
          })
          const updatedBundle = await getHauzUserBundle(authUser)
          setBundle(updatedBundle)
          return updatedBundle
        } catch (provErr) {
          console.error('Auto-provision on refresh error:', provErr)
        }
      }

      return userBundle
    } catch {
      setUser(null)
      setBundle(null)
      return null
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const initAuth = async () => {
      setIsLoading(true)
      try {
        await refreshUser()
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsInitialized(true)
        }
      }
    }
    initAuth()
    return () => {
      isMounted = false
    }
  }, [refreshUser])

  const register = async (data: RegisterFormData) => {
    setIsLoading(true)
    try {
      const fullName = `${data.firstName.trim()} ${data.lastName.trim()}`

      // 1. Create Appwrite Auth user
      const createdUser = await account.create(
        ID.unique(),
        data.email.trim().toLowerCase(),
        data.password,
        fullName
      )

      // 2. Create session to allow updating prefs and sending verification
      try {
        await account.deleteSession('current').catch(() => {})
      } catch {
        // ignore
      }

      await account.createEmailPasswordSession(data.email.trim().toLowerCase(), data.password)

      // 3. Store registration metadata into user preferences
      await account.updatePrefs({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        role: data.role,
        contactPhone: data.contactPhone ? data.contactPhone.trim() : null,
      })

      // 4. Send email verification
      const verifyUrl = `${window.location.origin}/verify`
      await account.createVerification(verifyUrl)

      await refreshUser()
      return { user: createdUser }
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, pass: string): Promise<HauzUserBundle> => {
    setIsLoading(true)
    try {
      try {
        // Clear any previous stale session if exists
        await account.deleteSession('current').catch(() => {})
      } catch {
        // ignore
      }

      await account.createEmailPasswordSession(email.trim().toLowerCase(), pass)
      const refreshed = await refreshUser()
      if (!refreshed) {
        throw new Error('Failed to retrieve user account after login.')
      }
      return refreshed
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    setIsLoading(true)
    try {
      await account.deleteSession('current').catch(() => {})
      setUser(null)
      setBundle(null)
    } finally {
      setIsLoading(false)
    }
  }

  const resendVerification = async () => {
    const verifyUrl = `${window.location.origin}/verify`
    await account.createVerification(verifyUrl)
  }

  const completeVerification = async (userId: string, secret: string): Promise<HauzUserBundle> => {
    setIsLoading(true)
    try {
      // 1. Update Appwrite Auth verification state
      await account.updateVerification(userId, secret)

      // 2. Get current auth user details
      const authUser = await account.get()
      setUser(authUser)

      const prefs = authUser.prefs || {}
      const role = (prefs.role as PersonalRoleValue) || 'consumer'
      const firstName = prefs.firstName || authUser.name.split(' ')[0] || 'User'
      const lastName = prefs.lastName || authUser.name.split(' ').slice(1).join(' ') || ''
      const contactPhone = prefs.contactPhone || null

      // 3. Provision HAUZ records (accounts, account_access_grants, personal_accounts)
      await provisionHauzRecords({
        userId: authUser.$id,
        firstName,
        lastName,
        role,
        contactPhone,
      })

      // 4. Load full updated bundle
      const updatedBundle = await getHauzUserBundle(authUser)
      setBundle(updatedBundle)
      return updatedBundle
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        bundle,
        isLoading,
        isInitialized,
        login,
        register,
        logout,
        resendVerification,
        completeVerification,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
