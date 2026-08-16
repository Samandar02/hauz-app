import * as sdk from 'node-appwrite'
import * as dotenv from 'dotenv'
import { resolve } from 'node:path'

dotenv.config({ path: resolve(process.cwd(), '.env') })

const endpoint = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const projectId = process.env.VITE_APPWRITE_PROJECT_ID
const apiKey = process.env.APPWRITE_API_KEY
const databaseId = process.env.VITE_APPWRITE_DATABASE_ID || 'hauz_db'

const rolesCollectionId = process.env.VITE_APPWRITE_COLLECTION_ROLES_ID || 'personal_roles'
const accountsCollectionId = process.env.VITE_APPWRITE_COLLECTION_ACCOUNTS_ID || 'accounts'
const grantsCollectionId = process.env.VITE_APPWRITE_COLLECTION_GRANTS_ID || 'account_access_grants'
const personalAccountsCollectionId = process.env.VITE_APPWRITE_COLLECTION_PERSONAL_ACCOUNTS_ID || 'personal_accounts'

if (!projectId || !apiKey) {
  console.error('\n❌ ERROR: VITE_APPWRITE_PROJECT_ID and APPWRITE_API_KEY must be set in your .env file.')
  console.error('Please configure your .env file and run again.\n')
  process.exit(1)
}

const client = new sdk.Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey)

const databases = new sdk.Databases(client)

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function waitForAttribute(dbId: string, collId: string, key: string, maxAttempts = 20) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const attr = await databases.getAttribute(dbId, collId, key)
      if (attr.status === 'available') {
        return
      }
    } catch {
      // ignore
    }
    await sleep(800)
  }
}

async function createAttributeSafely(
  fn: () => Promise<any>,
  name: string,
  dbId: string,
  collId: string,
  key: string
) {
  try {
    process.stdout.write(`  - Creating attribute '${key}'... `)
    await fn()
    await waitForAttribute(dbId, collId, key)
    console.log('✅')
  } catch (err: any) {
    if (err?.code === 409 || err?.message?.includes('already exists')) {
      console.log('⚡ (already exists)')
    } else {
      console.log(`⚠️ (${err?.message || 'warning'})`)
    }
  }
}

async function createIndexSafely(
  dbId: string,
  collId: string,
  key: string,
  type: 'key' | 'unique' | 'fulltext',
  attributes: string[]
) {
  try {
    for (const attr of attributes) {
      await waitForAttribute(dbId, collId, attr)
    }
    process.stdout.write(`  - Creating index '${key}' on [${attributes.join(', ')}]... `)
    await databases.createIndex(dbId, collId, key, type as any, attributes)
    console.log('✅')
  } catch (err: any) {
    if (err?.code === 409 || err?.message?.includes('already exists')) {
      console.log('⚡ (already exists)')
    } else {
      console.log(`⚠️ (${err?.message || 'warning'})`)
    }
  }
}

async function main() {
  console.log('\n🚀 Starting HAUZ Appwrite Schema Setup...\n')
  console.log(`Endpoint:     ${endpoint}`)
  console.log(`Project ID:   ${projectId}`)
  console.log(`Database ID:  ${databaseId}\n`)

  // 1. Database creation
  try {
    process.stdout.write(`1. Checking / Creating Database '${databaseId}'... `)
    await databases.get(databaseId)
    console.log('✅ (exists)')
  } catch (err: any) {
    if (err?.code === 404) {
      await databases.create(databaseId, 'HAUZ Database')
      console.log('✅ (created)')
    } else {
      throw err
    }
  }

  const defaultPermissions = [
    sdk.Permission.read(sdk.Role.any()),
    sdk.Permission.create(sdk.Role.any()),
    sdk.Permission.update(sdk.Role.any()),
    sdk.Permission.delete(sdk.Role.any()),
  ]

  // 2. Collections creation
  const collections = [
    { id: rolesCollectionId, name: 'personal_roles' },
    { id: accountsCollectionId, name: 'accounts' },
    { id: grantsCollectionId, name: 'account_access_grants' },
    { id: personalAccountsCollectionId, name: 'personal_accounts' },
  ]

  for (const coll of collections) {
    try {
      process.stdout.write(`2. Checking Collection '${coll.id}'... `)
      await databases.getCollection(databaseId, coll.id)
      console.log('✅ (exists)')
    } catch (err: any) {
      if (err?.code === 404) {
        await databases.createCollection(
          databaseId,
          coll.id,
          coll.name,
          defaultPermissions,
          false,
          true
        )
        console.log('✅ (created)')
      } else {
        throw err
      }
    }
  }

  // 3. Attributes for personal_roles
  console.log(`\n3. Configuring attributes & indexes for '${rolesCollectionId}'...`)
  await createAttributeSafely(
    () => databases.createEnumAttribute(databaseId, rolesCollectionId, 'value', ['consumer', 'realtor'], true),
    'value',
    databaseId,
    rolesCollectionId,
    'value'
  )
  await createIndexSafely(databaseId, rolesCollectionId, 'uq_personal_roles_value', 'unique', ['value'])

  // 4. Attributes for accounts
  console.log(`\n4. Configuring attributes & indexes for '${accountsCollectionId}'...`)
  await createAttributeSafely(
    () => databases.createEnumAttribute(databaseId, accountsCollectionId, 'account_type', ['individual'], true),
    'account_type',
    databaseId,
    accountsCollectionId,
    'account_type'
  )
  await createAttributeSafely(
    () => databases.createEnumAttribute(databaseId, accountsCollectionId, 'status', ['active', 'blocked'], true),
    'status',
    databaseId,
    accountsCollectionId,
    'status'
  )
  await createAttributeSafely(
    () => databases.createDatetimeAttribute(databaseId, accountsCollectionId, 'terminated_at', false),
    'terminated_at',
    databaseId,
    accountsCollectionId,
    'terminated_at'
  )
  await createAttributeSafely(
    () => databases.createStringAttribute(databaseId, accountsCollectionId, 'current_access_grant_id', 36, false),
    'current_access_grant_id',
    databaseId,
    accountsCollectionId,
    'current_access_grant_id'
  )
  await createIndexSafely(databaseId, accountsCollectionId, 'ix_accounts_type_status', 'key', ['account_type', 'status'])
  await createIndexSafely(databaseId, accountsCollectionId, 'ix_accounts_terminated', 'key', ['terminated_at'])

  // 5. Attributes for account_access_grants
  console.log(`\n5. Configuring attributes & indexes for '${grantsCollectionId}'...`)
  await createAttributeSafely(
    () => databases.createStringAttribute(databaseId, grantsCollectionId, 'appwrite_user_id', 36, true),
    'appwrite_user_id',
    databaseId,
    grantsCollectionId,
    'appwrite_user_id'
  )
  await createAttributeSafely(
    () => databases.createStringAttribute(databaseId, grantsCollectionId, 'account_id', 36, true),
    'account_id',
    databaseId,
    grantsCollectionId,
    'account_id'
  )
  await createAttributeSafely(
    () => databases.createDatetimeAttribute(databaseId, grantsCollectionId, 'revoked_at', false),
    'revoked_at',
    databaseId,
    grantsCollectionId,
    'revoked_at'
  )
  await createIndexSafely(databaseId, grantsCollectionId, 'ix_grants_user_access', 'key', ['appwrite_user_id', 'revoked_at'])
  await createIndexSafely(databaseId, grantsCollectionId, 'ix_grants_account_history', 'key', ['account_id', 'revoked_at'])
  await createIndexSafely(databaseId, grantsCollectionId, 'ix_grants_user_account', 'key', ['appwrite_user_id', 'account_id', 'revoked_at'])

  // 6. Attributes for personal_accounts
  console.log(`\n6. Configuring attributes & indexes for '${personalAccountsCollectionId}'...`)
  await createAttributeSafely(
    () => databases.createStringAttribute(databaseId, personalAccountsCollectionId, 'account_id', 36, true),
    'account_id',
    databaseId,
    personalAccountsCollectionId,
    'account_id'
  )
  await createAttributeSafely(
    () => databases.createStringAttribute(databaseId, personalAccountsCollectionId, 'role_id', 36, true),
    'role_id',
    databaseId,
    personalAccountsCollectionId,
    'role_id'
  )
  await createAttributeSafely(
    () => databases.createStringAttribute(databaseId, personalAccountsCollectionId, 'first_name', 100, true),
    'first_name',
    databaseId,
    personalAccountsCollectionId,
    'first_name'
  )
  await createAttributeSafely(
    () => databases.createStringAttribute(databaseId, personalAccountsCollectionId, 'last_name', 100, true),
    'last_name',
    databaseId,
    personalAccountsCollectionId,
    'last_name'
  )
  await createAttributeSafely(
    () => databases.createStringAttribute(databaseId, personalAccountsCollectionId, 'contact_phone', 20, false),
    'contact_phone',
    databaseId,
    personalAccountsCollectionId,
    'contact_phone'
  )
  await createIndexSafely(databaseId, personalAccountsCollectionId, 'uq_personal_account', 'unique', ['account_id'])
  await createIndexSafely(databaseId, personalAccountsCollectionId, 'ix_personal_role', 'key', ['role_id'])
  await createIndexSafely(databaseId, personalAccountsCollectionId, 'ix_personal_contact_phone', 'key', ['contact_phone'])

  // 7. Seed personal_roles table with 'consumer' and 'realtor'
  console.log(`\n7. Seeding '${rolesCollectionId}' with default roles (consumer, realtor)...`)
  const roles = ['consumer', 'realtor']
  for (const roleVal of roles) {
    try {
      const existing = await databases.listDocuments(databaseId, rolesCollectionId, [
        sdk.Query.equal('value', roleVal),
      ])
      if (existing.total > 0) {
        console.log(`  - Role '${roleVal}' already exists: (ID: ${existing.documents[0].$id})`)
      } else {
        const doc = await databases.createDocument(
          databaseId,
          rolesCollectionId,
          sdk.ID.unique(),
          { value: roleVal }
        )
        console.log(`  - Role '${roleVal}' created: (ID: ${doc.$id}) ✅`)
      }
    } catch (err: any) {
      console.log(`  - Could not check/seed role '${roleVal}': ${err.message}`)
    }
  }

  console.log('\n✨ HAUZ Appwrite Schema Setup Finished Successfully! ✨\n')
}

main().catch((err) => {
  console.error('\n❌ Fatal Setup Error:', err)
  process.exit(1)
})
