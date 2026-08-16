import { Client, Account, Databases, Functions, ID, Query } from 'appwrite'

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1'
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || ''

export const APPWRITE_CONFIG = {
  endpoint,
  projectId,
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'hauz_db',
  collections: {
    roles: import.meta.env.VITE_APPWRITE_COLLECTION_ROLES_ID || 'personal_roles',
    accounts: import.meta.env.VITE_APPWRITE_COLLECTION_ACCOUNTS_ID || 'accounts',
    grants: import.meta.env.VITE_APPWRITE_COLLECTION_GRANTS_ID || 'account_access_grants',
    personalAccounts: import.meta.env.VITE_APPWRITE_COLLECTION_PERSONAL_ACCOUNTS_ID || 'personal_accounts',
  },
}

export const client = new Client()

if (projectId) {
  client.setEndpoint(endpoint).setProject(projectId)
}

export const account = new Account(client)
export const databases = new Databases(client)
export const functions = new Functions(client)

export { ID, Query }
