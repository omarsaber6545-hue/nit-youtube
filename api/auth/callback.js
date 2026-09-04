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
    console.error('Failed to persist database in OAuth callback:', err);
  }
}

module.exports = async (req, res) => {
  const { code, state, error, error_description } = req.query;

  if (error) {
    return res.redirect(
      `/admin.html?tab=tab-autopost&error=auth_denied&msg=${encodeURIComponent(error_description || 'تم إلغاء عملية التفويض')}`
    );
  }

  if (!code) {
    return res.redirect(
      `/admin.html?tab=tab-autopost&error=no_code&msg=${encodeURIComponent('رمز التفويض مفقود')}`
    );
  }

  let platform = 'youtube';
  try {
    if (state) {
      const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
      platform = decoded.platform || 'youtube';
    }
  } catch (e) {}

  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const proto = req.headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https');
  const redirectUri = `${proto}://${host}/api/auth/callback`;

  const dbObj = getDatabase();
  const creds = dbObj.data.oauth?.credentials || {};

  try {
    let tokenData = null;
    let accountInfo = { name: '', id: '', avatar: '' };

    // 1. Google / YouTube Token Exchange
    if (platform === 'youtube' || platform === 'google') {
      const clientId = creds.googleClientId || process.env.GOOGLE_CLIENT_ID;
      const clientSecret = creds.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;

      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });

      tokenData = await tokenRes.json();
      if (!tokenRes.ok || tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error || 'فشل تبادل رمز Google');
      }

      // Fetch Channel Details
      try {
        const chanRes = await fetch(
          'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
          {
            headers: { Authorization: `Bearer ${tokenData.access_token}` }
          }
        );
        if (chanRes.ok) {
          const chanData = await chanRes.json();
          const channel = chanData.items?.[0];
          if (channel) {
            accountInfo = {
              name: channel.snippet?.title || 'YouTube Channel',
              id: channel.id,
              avatar: channel.snippet?.thumbnails?.default?.url || ''
            };

            // Auto-update YouTube channel in autoPoster
            if (dbObj.data.autoPoster?.youtube) {
              dbObj.data.autoPoster.youtube.channelId = channel.id;
              dbObj.data.autoPoster.youtube.channelUrl = `https://www.youtube.com/channel/${channel.id}`;
            }
          }
        }
      } catch (chanErr) {
        console.error('Failed to fetch YouTube channel profile:', chanErr);
        accountInfo.name = 'YouTube Channel (Connected)';
      }
    }

    // 2. TikTok Token Exchange
    else if (platform === 'tiktok') {
      const clientKey = creds.tiktokClientKey || process.env.TIKTOK_CLIENT_KEY;
      const clientSecret = creds.tiktokClientSecret || process.env.TIKTOK_CLIENT_SECRET;

      const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_key: clientKey,
          client_secret: clientSecret,
          code,
          grant_type: 'authorization_code',
          redirect_uri: redirectUri
        })
      });

      tokenData = await tokenRes.json();
      if (!tokenRes.ok || tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.message || 'فشل تبادل رمز TikTok');
      }

      accountInfo = {
        name: tokenData.open_id ? `TikTok User (${tokenData.open_id.substring(0, 8)}...)` : 'TikTok Connected',
        id: tokenData.open_id || ''
      };
    }

    // 3. Instagram Token Exchange
    else if (platform === 'instagram') {
      const clientId = creds.instagramClientId || process.env.INSTAGRAM_CLIENT_ID;
      const clientSecret = creds.instagramClientSecret || process.env.INSTAGRAM_CLIENT_SECRET;

      const form = new URLSearchParams();
      form.append('client_id', clientId);
      form.append('client_secret', clientSecret);
      form.append('grant_type', 'authorization_code');
      form.append('redirect_uri', redirectUri);
      form.append('code', code);

      const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
        method: 'POST',
        body: form
      });

      tokenData = await tokenRes.json();
      if (!tokenRes.ok || tokenData.error_type) {
        throw new Error(tokenData.error_message || 'فشل تبادل رمز Instagram');
      }

      // Exchange short-lived token for long-lived 60-day token
      let finalAccessToken = tokenData.access_token;
      try {
        const longRes = await fetch(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${clientSecret}&access_token=${tokenData.access_token}`
        );
        if (longRes.ok) {
          const longData = await longRes.json();
          if (longData.access_token) {
            finalAccessToken = longData.access_token;
            tokenData.expires_in = longData.expires_in;
          }
        }
      } catch (e) {}

      tokenData.access_token = finalAccessToken;

      // Fetch username
      try {
        const userRes = await fetch(
          `https://graph.instagram.com/me?fields=id,username&access_token=${finalAccessToken}`
        );
        if (userRes.ok) {
          const u = await userRes.json();
          accountInfo = {
            name: u.username ? `@${u.username}` : 'Instagram User',
            id: u.id || tokenData.user_id
          };
        }
      } catch (e) {
        accountInfo.name = `@user_${tokenData.user_id}`;
      }
    }

    // Save tokens in database
    dbObj.data.oauth = dbObj.data.oauth || {};
    dbObj.data.oauth[platform] = {
      connected: true,
      account: accountInfo,
      tokens: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresIn: tokenData.expires_in || null,
        tokenType: tokenData.token_type || 'Bearer',
        scope: tokenData.scope || null
      },
      updatedAt: new Date().toISOString()
    };

    saveDatabase(dbObj);

    return res.redirect(
      `/admin.html?tab=tab-autopost&connected=${platform}&name=${encodeURIComponent(accountInfo.name || platform)}`
    );
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    return res.redirect(
      `/admin.html?tab=tab-autopost&error=token_failed&platform=${platform}&msg=${encodeURIComponent(
        err.message || 'فشل إتمام عملية الربط'
      )}`
    );
  }
};
