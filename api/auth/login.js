const fs = require('fs');
const path = require('path');

function getOAuthCredentials() {
  const dbPaths = [
    path.join(process.cwd(), 'data/database.json'),
    path.join(__dirname, '../../data/database.json'),
    path.join(__dirname, '../../../data/database.json')
  ];

  let stored = {};
  for (const p of dbPaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = JSON.parse(fs.readFileSync(p, 'utf8'));
        stored = raw.oauth?.credentials || {};
        break;
      } catch (e) {}
    }
  }

  return {
    googleClientId: stored.googleClientId || process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: stored.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET || '',
    tiktokClientKey: stored.tiktokClientKey || process.env.TIKTOK_CLIENT_KEY || '',
    tiktokClientSecret: stored.tiktokClientSecret || process.env.TIKTOK_CLIENT_SECRET || '',
    instagramClientId: stored.instagramClientId || process.env.INSTAGRAM_CLIENT_ID || '',
    instagramClientSecret: stored.instagramClientSecret || process.env.INSTAGRAM_CLIENT_SECRET || ''
  };
}

module.exports = async (req, res) => {
  const platform = (req.query.platform || '').toLowerCase().trim();
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  const redirectUri = `${proto}://${host}/api/auth/callback`;

  const creds = getOAuthCredentials();
  const state = Buffer.from(JSON.stringify({ platform, timestamp: Date.now() })).toString('base64');

  if (platform === 'youtube' || platform === 'google') {
    const clientId = creds.googleClientId;
    if (!clientId) {
      return res.redirect(
        `/admin.html?tab=tab-autopost&error=missing_client_id&platform=youtube&msg=${encodeURIComponent(
          'يرجى إدخال Google Client ID أولاً لتفعيل ربط YouTube'
        )}`
      );
    }

    const scope = encodeURIComponent('https://www.googleapis.com/auth/youtube.readonly');
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${state}`;

    return res.redirect(authUrl);
  }

  if (platform === 'tiktok') {
    const clientKey = creds.tiktokClientKey;
    if (!clientKey) {
      return res.redirect(
        `/admin.html?tab=tab-autopost&error=missing_client_id&platform=tiktok&msg=${encodeURIComponent(
          'يرجى إدخال TikTok Client Key أولاً لتفعيل ربط TikTok'
        )}`
      );
    }

    const scope = encodeURIComponent('user.info.basic,video.list');
    const authUrl = `https://www.tiktok.com/v2/auth/authorize/?client_key=${clientKey}&scope=${scope}&response_type=code&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${state}`;

    return res.redirect(authUrl);
  }

  if (platform === 'instagram') {
    const clientId = creds.instagramClientId;
    if (!clientId) {
      return res.redirect(
        `/admin.html?tab=tab-autopost&error=missing_client_id&platform=instagram&msg=${encodeURIComponent(
          'يرجى إدخال Instagram App ID أولاً لتفعيل ربط Instagram'
        )}`
      );
    }

    const scope = encodeURIComponent('user_profile,user_media');
    const authUrl = `https://api.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&scope=${scope}&response_type=code&state=${state}`;

    return res.redirect(authUrl);
  }

  return res.status(400).json({ error: 'المنصة المحددة غير مدعومة. الخيارات: youtube, tiktok, instagram' });
};
