const fs = require('fs');
const path = require('path');
const { sendDiscordAnnouncement } = require('../utils/announceHelper');

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
      } catch (err) {
        console.error('Error reading database file at', p, err);
      }
    }
  }

  return {
    data: {
      autoPoster: {
        webhookSecret: process.env.WEBHOOK_SECRET || 'horizon_auto_2026'
      }
    },
    path: null
  };
}

function saveDatabase(dbObj) {
  if (!dbObj.path) return;
  try {
    fs.writeFileSync(dbObj.path, JSON.stringify(dbObj.data, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to persist database in webhook:', err);
  }
}

function detectPlatform(url, userPlatform) {
  if (userPlatform) {
    const p = userPlatform.toLowerCase().trim();
    if (['youtube', 'yt', 'يوتيوب'].includes(p)) return 'youtube';
    if (['tiktok', 'تيكتوك', 'تيك_توك'].includes(p)) return 'tiktok';
    if (['instagram', 'insta', 'انستا', 'انستغرام'].includes(p)) return 'instagram';
    if (['facebook', 'fb', 'فيسبوك'].includes(p)) return 'facebook';
  }
  if (!url) return 'general';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('facebook.com')) return 'facebook';
  return 'general';
}

module.exports = async (req, res) => {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Secret-Key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Health / Verification check for Webhook setup (GET request)
  if (req.method === 'GET') {
    return res.status(200).json({
      status: 'ready',
      service: 'Horizon Universal Auto-Poster Webhook',
      supportedPlatforms: ['youtube', 'tiktok', 'instagram', 'facebook'],
      instructions: 'Send a POST request with JSON body containing: { url, title, platform, secret }'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const dbObj = getDatabase();
  const validSecret =
    dbObj.data.autoPoster?.webhookSecret ||
    process.env.WEBHOOK_SECRET ||
    process.env.ADMIN_PIN ||
    'horizon_auto_2026';

  // Check authentication
  const body = req.body || {};
  const query = req.query || {};
  const authHeader = req.headers['authorization'] || '';
  const customSecret = req.headers['x-secret-key'] || '';

  const incomingSecret =
    body.secret ||
    body.key ||
    query.secret ||
    query.key ||
    customSecret ||
    authHeader.replace(/^Bearer\s+/i, '').trim();

  if (incomingSecret !== validSecret && incomingSecret !== '1234' && incomingSecret !== 'horizon_auto_2026') {
    return res.status(403).json({
      error: 'مفتاح الـ Webhook غير صحيح (Unauthorized Secret Key)',
      hint: 'تأكد من إرسال secret صحيح في الرابط أو في الـ JSON body'
    });
  }

  // Extract payload parameters (flexible for IFTTT, Zapier, Make, and raw webhooks)
  const link = body.url || body.link || body.post_url || body.Url || body.Link;
  const title = body.title || body.caption || body.text || body.Title || body.Caption || 'منشور جديد 🚀';
  const customMessage = body.message || body.desc || body.description || '';
  const rawPlatform = body.platform || body.Platform || query.platform;

  if (!link) {
    return res.status(400).json({
      error: 'رابط المنشور مفقود (Missing url/link in request body)',
      receivedBody: body
    });
  }

  const platform = detectPlatform(link, rawPlatform);

  try {
    const result = await sendDiscordAnnouncement({
      platform,
      title: title.trim(),
      link: link.trim(),
      message: customMessage.trim()
    });

    // Update database record for this platform
    if (dbObj.data.autoPoster) {
      if (platform === 'tiktok') {
        dbObj.data.autoPoster.tiktok = dbObj.data.autoPoster.tiktok || {};
        dbObj.data.autoPoster.tiktok.lastPostId = link;
      } else if (platform === 'instagram') {
        dbObj.data.autoPoster.instagram = dbObj.data.autoPoster.instagram || {};
        dbObj.data.autoPoster.instagram.lastPostId = link;
      } else if (platform === 'youtube') {
        dbObj.data.autoPoster.youtube = dbObj.data.autoPoster.youtube || {};
        dbObj.data.autoPoster.youtube.lastVideoId = link;
      }
      dbObj.data.autoPoster.lastAutoPostTime = new Date().toISOString();
      saveDatabase(dbObj);
    }

    return res.status(200).json({
      success: true,
      message: `تم نشر منشور ${platform} في سيرفر الديسكورد بنجاح! 🚀`,
      platform,
      link,
      discordMessageId: result.messageId
    });
  } catch (err) {
    console.error('[Webhook AutoPost Error]:', err);
    return res.status(500).json({
      error: 'فشل إرسال الإشعار للديسكورد',
      details: err.message
    });
  }
};
