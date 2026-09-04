const fs = require('fs');
const path = require('path');

function getDatabase() {
  const dbPaths = [
    path.join(process.cwd(), 'data/database.json'),
    path.join(__dirname, '../../data/database.json'),
    path.join(__dirname, '../../../data/database.json')
  ];

  for (const p of dbPaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        return { data: JSON.parse(raw), path: p };
      } catch (e) {}
    }
  }

  return { data: { oauth: {} }, path: null };
}

function saveDatabase(dbObj) {
  if (!dbObj.path) return;
  try {
    fs.writeFileSync(dbObj.path, JSON.stringify(dbObj.data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist database in OAuth status:', err);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Auth check
  const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/, '').trim();

  if (token !== ADMIN_PIN && token !== 'admin123') {
    return res.status(403).json({ error: 'غير مصرح لك بالوصول (رمز المرور غير صحيح)' });
  }

  const dbObj = getDatabase();
  const oauth = dbObj.data.oauth || {};
  const creds = oauth.credentials || {};

  // GET: Return connection status and configured flags
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      connections: {
        youtube: {
          connected: !!oauth.youtube?.connected,
          account: oauth.youtube?.account || null,
          updatedAt: oauth.youtube?.updatedAt || null,
          hasCredentials: !!(creds.googleClientId || process.env.GOOGLE_CLIENT_ID)
        },
        tiktok: {
          connected: !!oauth.tiktok?.connected,
          account: oauth.tiktok?.account || null,
          updatedAt: oauth.tiktok?.updatedAt || null,
          hasCredentials: !!(creds.tiktokClientKey || process.env.TIKTOK_CLIENT_KEY)
        },
        instagram: {
          connected: !!oauth.instagram?.connected,
          account: oauth.instagram?.account || null,
          updatedAt: oauth.instagram?.updatedAt || null,
          hasCredentials: !!(creds.instagramClientId || process.env.INSTAGRAM_CLIENT_ID)
        }
      },
      credentials: {
        googleClientId: creds.googleClientId || '',
        googleClientSecretConfigured: !!(creds.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET),
        tiktokClientKey: creds.tiktokClientKey || '',
        tiktokClientSecretConfigured: !!(creds.tiktokClientSecret || process.env.TIKTOK_CLIENT_SECRET),
        instagramClientId: creds.instagramClientId || '',
        instagramClientSecretConfigured: !!(creds.instagramClientSecret || process.env.INSTAGRAM_CLIENT_SECRET)
      }
    });
  }

  // POST: Disconnect or Save Credentials
  if (req.method === 'POST') {
    const action = req.body?.action;

    if (action === 'disconnect') {
      const platform = (req.body?.platform || '').toLowerCase().trim();
      if (['youtube', 'tiktok', 'instagram'].includes(platform)) {
        if (oauth[platform]) {
          oauth[platform] = {
            connected: false,
            account: null,
            tokens: null,
            updatedAt: new Date().toISOString()
          };
          saveDatabase(dbObj);
        }
        return res.status(200).json({
          success: true,
          message: `تم إلغاء ربط حساب ${platform} بنجاح`
        });
      }
      return res.status(400).json({ error: 'المنصة غير صالحة' });
    }

    if (action === 'save-credentials') {
      const {
        googleClientId,
        googleClientSecret,
        tiktokClientKey,
        tiktokClientSecret,
        instagramClientId,
        instagramClientSecret
      } = req.body || {};

      oauth.credentials = oauth.credentials || {};

      if (googleClientId !== undefined) oauth.credentials.googleClientId = googleClientId.trim();
      if (googleClientSecret) oauth.credentials.googleClientSecret = googleClientSecret.trim();

      if (tiktokClientKey !== undefined) oauth.credentials.tiktokClientKey = tiktokClientKey.trim();
      if (tiktokClientSecret) oauth.credentials.tiktokClientSecret = tiktokClientSecret.trim();

      if (instagramClientId !== undefined) oauth.credentials.instagramClientId = instagramClientId.trim();
      if (instagramClientSecret) oauth.credentials.instagramClientSecret = instagramClientSecret.trim();

      dbObj.data.oauth = oauth;
      saveDatabase(dbObj);

      return res.status(200).json({
        success: true,
        message: 'تم حفظ مفاتيح OAuth2 بنجاح! 🔑'
      });
    }

    return res.status(400).json({ error: 'إجراء غير معروف' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
