const sdk = require('node-appwrite');

/**
 * Appwrite Function: Provision HAUZ Account on Email Verification
 * Trigger: Event (users.*.update.verification) or HTTP execution
 */
module.exports = async function (context) {
  const client = new sdk.Client();
  const databases = new sdk.Databases(client);

  const endpoint = process.env.APPWRITE_FUNCTION_ENDPOINT || process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
  const projectId = process.env.APPWRITE_FUNCTION_PROJECT_ID || process.env.APPWRITE_PROJECT_ID;
  const apiKey = process.env.APPWRITE_API_KEY;
  const databaseId = process.env.APPWRITE_DATABASE_ID || 'hauz_db';

  if (!projectId || !apiKey) {
    context.error('Missing APPWRITE_FUNCTION_PROJECT_ID or APPWRITE_API_KEY');
    return context.res.json({ success: false, error: 'Server configuration error' }, 500);
  }

  client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  try {
    let payload = {};
    if (context.req.body) {
      payload = typeof context.req.body === 'string' ? JSON.parse(context.req.body) : context.req.body;
    }

    const userId = payload.userId || context.req.headers['x-appwrite-user-id'];
    if (!userId) {
      return context.res.json({ success: false, error: 'User ID is required' }, 400);
    }

    const users = new sdk.Users(client);
    const authUser = await users.get(userId);

    if (!authUser.emailVerification) {
      return context.res.json({ success: false, error: 'User email is not verified yet.' }, 400);
    }

    // 1. Idempotency Check: check if already exists
    const existingGrants = await databases.listDocuments(
      databaseId,
      'account_access_grants',
      [sdk.Query.equal('appwrite_user_id', userId), sdk.Query.equal('revoked_at', null)]
    );

    if (existingGrants.total > 0) {
      return context.res.json({
        success: true,
        message: 'HAUZ account already provisioned',
        grantId: existingGrants.documents[0].$id,
      });
    }

    // 2. Fetch role
    const userRole = (authUser.prefs && authUser.prefs.role) || payload.role || 'consumer';
    const roleRes = await databases.listDocuments(
      databaseId,
      'personal_roles',
      [sdk.Query.equal('value', userRole), sdk.Query.limit(1)]
    );

    if (roleRes.total === 0) {
      throw new Error(`Personal role '${userRole}' not found in database.`);
    }
    const roleId = roleRes.documents[0].$id;

    // 3. Generate IDs
    const accountId = sdk.ID.unique();
    const grantId = sdk.ID.unique();
    const personalAccountId = sdk.ID.unique();

    const createdDocs = [];

    try {
      // Step A: Create accounts
      const acc = await databases.createDocument(
        databaseId,
        'accounts',
        accountId,
        {
          account_type: 'individual',
          status: 'active',
          terminated_at: null,
          current_access_grant_id: grantId,
        }
      );
      createdDocs.push({ coll: 'accounts', id: acc.$id });

      // Step B: Create account_access_grants
      const grant = await databases.createDocument(
        databaseId,
        'account_access_grants',
        grantId,
        {
          appwrite_user_id: userId,
          account_id: accountId,
          revoked_at: null,
        }
      );
      createdDocs.push({ coll: 'account_access_grants', id: grant.$id });

      // Step C: Create personal_accounts
      const prefs = authUser.prefs || {};
      const firstName = prefs.firstName || payload.firstName || authUser.name.split(' ')[0] || 'User';
      const lastName = prefs.lastName || payload.lastName || authUser.name.split(' ').slice(1).join(' ') || '';
      const contactPhone = prefs.contactPhone || payload.contactPhone || null;

      const personal = await databases.createDocument(
        databaseId,
        'personal_accounts',
        personalAccountId,
        {
          account_id: accountId,
          role_id: roleId,
          first_name: firstName,
          last_name: lastName,
          contact_phone: contactPhone,
        }
      );
      createdDocs.push({ coll: 'personal_accounts', id: personal.$id });

      return context.res.json({
        success: true,
        accountId: acc.$id,
        grantId: grant.$id,
        personalAccountId: personal.$id,
      });
    } catch (innerError) {
      // Rollback
      for (const d of createdDocs.reverse()) {
        try {
          await databases.deleteDocument(databaseId, d.coll, d.id);
        } catch (e) {}
      }
      throw innerError;
    }
  } catch (err) {
    context.error('Function error: ' + err.message);
    return context.res.json({ success: false, error: err.message }, 500);
  }
};
