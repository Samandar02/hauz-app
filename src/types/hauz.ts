import type { Models } from 'appwrite'

export type AccountType = 'individual'
export type AccountStatus = 'active' | 'blocked'
export type PersonalRoleValue = 'consumer' | 'realtor'

export interface PersonalRoleDocument extends Models.Document {
  value: PersonalRoleValue
}

export interface AccountDocument extends Models.Document {
  account_type: AccountType
  status: AccountStatus
  terminated_at: string | null
  current_access_grant_id: string | null
}

export interface AccountAccessGrantDocument extends Models.Document {
  appwrite_user_id: string
  account_id: string | AccountDocument
  revoked_at: string | null
}

export interface PersonalAccountDocument extends Models.Document {
  account_id: string | AccountDocument
  role_id: string | PersonalRoleDocument
  first_name: string
  last_name: string
  contact_phone: string | null
}

export interface HauzUserBundle {
  authAccount: Models.User<Models.Preferences>
  account: AccountDocument | null
  personalAccount: PersonalAccountDocument | null
  personalRole: PersonalRoleDocument | null
  currentGrant: AccountAccessGrantDocument | null
  allGrants: AccountAccessGrantDocument[]
  isVerified: boolean
  hasHauzRecords: boolean
}

export interface RegisterFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  role: PersonalRoleValue
  contactPhone?: string
}
