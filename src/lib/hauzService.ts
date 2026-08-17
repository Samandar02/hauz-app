import { databases, Query, APPWRITE_CONFIG, ID } from './appwrite'
import type {
  AccountDocument,
  AccountAccessGrantDocument,
  PersonalAccountDocument,
  PersonalRoleDocument,
  PersonalRoleValue,
  HauzUserBundle,
} from '../types/hauz'
import type { Models } from 'appwrite'

const { databaseId, collections } = APPWRITE_CONFIG

/**
 * Generates a unique UUID formatted or standard Appwrite unique ID
 */
export function generateRowId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return ID.unique()
}

/**
 * Finds or retrieves the personal_role record for consumer or realtor
 */
export async function getPersonalRoleByValue(roleValue: PersonalRoleValue): Promise<PersonalRoleDocument> {
  const result = await databases.listDocuments<PersonalRoleDocument>(
    databaseId,
    collections.roles,
    [Query.equal('value', roleValue), Query.limit(1)]
  )

  if (result.total > 0 && result.documents[0]) {
    return result.documents[0]
  }

  // If not found in database, attempt to create it (self-healing)
  try {
    const newDoc = await databases.createDocument<PersonalRoleDocument>(
      databaseId,
      collections.roles,
      generateRowId(),
      { value: roleValue }
    )
    return newDoc
  } catch (err) {
    // If creation raced with another request, fetch again
    const retry = await databases.listDocuments<PersonalRoleDocument>(
      databaseId,
      collections.roles,
      [Query.equal('value', roleValue), Query.limit(1)]
    )
    if (retry.documents[0]) return retry.documents[0]
    throw new Error(`Personal role '${roleValue}' could not be located in database.`)
  }
}

/**
 * Fetches all HAUZ records connected to an Appwrite Auth User
 */
export async function getHauzUserBundle(authUser: Models.User<Models.Preferences>): Promise<HauzUserBundle> {
  try {
    // 1. Find access grants for this user
    const grantsResponse = await databases.listDocuments<AccountAccessGrantDocument>(
      databaseId,
      collections.grants,
      [Query.equal('appwrite_user_id', authUser.$id), Query.orderDesc('$createdAt'), Query.limit(10)]
    )

    const allGrants = grantsResponse.documents
    const activeGrant = allGrants.find((g) => g.revoked_at === null) || allGrants[0] || null

    if (!activeGrant) {
      return {
        authAccount: authUser,
        account: null,
        personalAccount: null,
        personalRole: null,
        currentGrant: null,
        allGrants: [],
        isVerified: authUser.emailVerification,
        hasHauzRecords: false,
      }
    }

    const accountId =
      typeof activeGrant.account_id === 'object' && activeGrant.account_id
        ? (activeGrant.account_id as any).$id
        : String(activeGrant.account_id)

    // 2. Fetch HAUZ Account record
    let accountDoc: AccountDocument | null = null
    try {
      accountDoc = await databases.getDocument<AccountDocument>(
        databaseId,
        collections.accounts,
        accountId
      )
    } catch {
      accountDoc = null
    }

    // 3. Fetch Personal Account profile
    let personalDoc: PersonalAccountDocument | null = null
    try {
      const personalRes = await databases.listDocuments<PersonalAccountDocument>(
        databaseId,
        collections.personalAccounts,
        [Query.equal('account_id', accountId), Query.limit(1)]
      )
      personalDoc = personalRes.documents[0] || null
    } catch {
      personalDoc = null
    }

    // 4. Fetch Role record
    let roleDoc: PersonalRoleDocument | null = null
    if (personalDoc) {
      const roleId =
        typeof personalDoc.role_id === 'object' && personalDoc.role_id
          ? (personalDoc.role_id as any).$id
          : String(personalDoc.role_id)
      try {
        roleDoc = await databases.getDocument<PersonalRoleDocument>(
          databaseId,
          collections.roles,
          roleId
        )
      } catch {
        roleDoc = null
      }
    }

    return {
      authAccount: authUser,
      account: accountDoc,
      personalAccount: personalDoc,
      personalRole: roleDoc,
      currentGrant: activeGrant,
      allGrants,
      isVerified: authUser.emailVerification,
      hasHauzRecords: Boolean(accountDoc && personalDoc),
    }
  } catch (error) {
    console.error('Error fetching HAUZ bundle:', error)
    return {
      authAccount: authUser,
      account: null,
      personalAccount: null,
      personalRole: null,
      currentGrant: null,
      allGrants: [],
      isVerified: authUser.emailVerification,
      hasHauzRecords: false,
    }
  }
}

export interface ProvisionHauzAccountParams {
  userId: string
  firstName: string
  lastName: string
  role: PersonalRoleValue
  contactPhone?: string | null
}

/**
 * Creates the exact HAUZ records according to schema with atomic rollback and idempotency:
 * 1. accounts
 * 2. account_access_grants
 * 3. personal_accounts
 */
export async function provisionHauzRecords(params: ProvisionHauzAccountParams) {
  const { userId, firstName, lastName, role, contactPhone } = params

  // 1. Idempotency Check: Verify if records already exist for this user
  const existingGrants = await databases.listDocuments<AccountAccessGrantDocument>(
    databaseId,
    collections.grants,
    [Query.equal('appwrite_user_id', userId), Query.equal('revoked_at', null as any), Query.limit(1)]
  ).catch(() => ({ total: 0, documents: [] }))

  if (existingGrants.total > 0 && existingGrants.documents[0]) {
    const existingGrant = existingGrants.documents[0]
    const existingAccountId =
      typeof existingGrant.account_id === 'object' && existingGrant.account_id
        ? (existingGrant.account_id as any).$id
        : String(existingGrant.account_id)

    const existingAccount = await databases.getDocument<AccountDocument>(
      databaseId,
      collections.accounts,
      existingAccountId
    )
    return {
      accountId: existingAccount.$id,
      grantId: existingGrant.$id,
      alreadyExisted: true,
    }
  }

  // 2. Fetch role document
  const roleDoc = await getPersonalRoleByValue(role)
  const roleId = roleDoc.$id

  // 3. Generate UUIDs for each HAUZ row
  const accountId = generateRowId()
  const grantId = generateRowId()
  const personalAccountId = generateRowId()

  const createdEntities: Array<{ coll: string; id: string }> = []

  try {
    // Step A: Create HAUZ Account
    // Fields: account_type (individual), status (active), terminated_at (null), current_access_grant_id (grantId)
    const accountPayload = {
      account_type: 'individual' as const,
      status: 'active' as const,
      terminated_at: null,
      current_access_grant_id: grantId,
    }

    const createdAccount = await databases.createDocument<AccountDocument>(
      databaseId,
      collections.accounts,
      accountId,
      accountPayload
    )
    createdEntities.push({ coll: collections.accounts, id: createdAccount.$id })

    // Step B: Create Account Access Grant
    // Fields: appwrite_user_id, account_id, revoked_at (null)
    const grantPayload = {
      appwrite_user_id: userId,
      account_id: accountId,
      revoked_at: null,
    }

    const createdGrant = await databases.createDocument<AccountAccessGrantDocument>(
      databaseId,
      collections.grants,
      grantId,
      grantPayload
    )
    createdEntities.push({ coll: collections.grants, id: createdGrant.$id })

    // Step C: Create Personal Account
    // Fields: account_id, role_id, first_name, last_name, contact_phone
    const personalPayload = {
      account_id: accountId,
      role_id: roleId,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      contact_phone: contactPhone ? contactPhone.trim() : null,
    }

    const createdPersonal = await databases.createDocument<PersonalAccountDocument>(
      databaseId,
      collections.personalAccounts,
      personalAccountId,
      personalPayload
    )
    createdEntities.push({ coll: collections.personalAccounts, id: createdPersonal.$id })

    return {
      accountId: createdAccount.$id,
      grantId: createdGrant.$id,
      personalAccountId: createdPersonal.$id,
      alreadyExisted: false,
    }
  } catch (error: any) {
    console.error('Failed to create HAUZ records. Rolling back partial entities...', error)

    // Rollback cleanup to prevent partial records
    for (const entity of createdEntities.reverse()) {
      try {
        await databases.deleteDocument(databaseId, entity.coll, entity.id)
        console.log(`Rollback: Deleted ${entity.coll} doc ${entity.id}`)
      } catch (cleanupErr) {
        console.warn(`Rollback error deleting ${entity.id}:`, cleanupErr)
      }
    }

    throw new Error(
      `Failed to create HAUZ records: ${error?.message || 'Database transaction error'}. All partial records were rolled back.`
    )
  }
}
