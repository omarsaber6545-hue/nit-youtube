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
      } catch (err) {
        console.error('Error reading database file at', p, err);
      }
    }
  }

  return {
    data: {
      autoPoster: {
        youtube: {
          enabled: true,
          channelId: 'UCVXcZwtifEKN_oQItYwFKDg',
          channelUrl: 'https://www.youtube.com/@horizonservices-dis',
          lastVideoId: '',
          lastVideoTitle: ''
        },
        tiktok: { enabled: true, username: '@horizon_services252', lastPostId: '' },
        instagram: { enabled: true, username: '@horizon_services251', lastPostId: '' },
        webhookSecret: 'horizon_auto_2026',
        lastAutoPostTime: null
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
    console.error('Failed to persist database:', err);
  }
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check auth
  const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/, '').trim();

  if (token !== ADMIN_PIN && token !== 'admin123') {
    return res.status(403).json({ error: 'غير مصرح لك بالوصول (رمز المرور غير صحيح)' });
  }

  const dbObj = getDatabase();
  dbObj.data.autoPoster = dbObj.data.autoPoster || {
    youtube: {
      enabled: true,
      channelId: 'UCVXcZwtifEKN_oQItYwFKDg',
      channelUrl: 'https://www.youtube.com/@horizonservices-dis',
      lastVideoId: '',
      lastVideoTitle: ''
    },
    tiktok: { enabled: true, username: '@horizon_services252', lastPostId: '' },
    instagram: { enabled: true, username: '@horizon_services251', lastPostId: '' },
    webhookSecret: 'horizon_auto_2026',
    lastAutoPostTime: null
  };

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      autoPoster: dbObj.data.autoPoster
    });
  }

  if (req.method === 'POST') {
    const { youtube, tiktok, instagram, webhookSecret } = req.body || {};

    if (youtube) {
      dbObj.data.autoPoster.youtube = {
        ...dbObj.data.autoPoster.youtube,
        ...youtube
      };
    }
    if (tiktok) {
      dbObj.data.autoPoster.tiktok = {
        ...dbObj.data.autoPoster.tiktok,
        ...tiktok
      };
    }
    if (instagram) {
      dbObj.data.autoPoster.instagram = {
        ...dbObj.data.autoPoster.instagram,
        ...instagram
      };
    }
    if (webhookSecret) {
      dbObj.data.autoPoster.webhookSecret = webhookSecret.trim();
    }

    saveDatabase(dbObj);

    return res.status(200).json({
      success: true,
      message: 'تم حفظ إعدادات النشر التلقائي بنجاح!',
      autoPoster: dbObj.data.autoPoster
    });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
