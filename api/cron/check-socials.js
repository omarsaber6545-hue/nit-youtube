const fs = require('fs');
const path = require('path');
const { sendDiscordAnnouncement } = require('../../lib/announceHelper');

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
          channelId: process.env.YOUTUBE_CHANNEL_ID || 'UCVXcZwtifEKN_oQItYwFKDg',
          lastVideoId: ''
        },
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
    console.error('Failed to persist database in check-socials:', err);
  }
}

module.exports = async (req, res) => {
  // CORS & Methods
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Security verification
  const secretKey = process.env.WEBHOOK_SECRET || process.env.ADMIN_PIN || '1234';
  const authHeader = req.headers['authorization'] || '';
  const queryKey = req.query?.key || req.query?.secret || '';
  const cronHeader = req.headers['x-vercel-cron'] || '';

  const isAuthorized =
    cronHeader || // Vercel automated cron trigger
    queryKey === secretKey ||
    queryKey === 'horizon_auto_2026' ||
    authHeader.includes(secretKey) ||
    authHeader.includes('1234');

  if (!isAuthorized && process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'غير مصرح لك بتنفيذ فحص الأتمتة' });
  }

  const dbObj = getDatabase();
  const autoPoster = dbObj.data.autoPoster || {
    youtube: { enabled: true, channelId: 'UCVXcZwtifEKN_oQItYwFKDg', lastVideoId: '' }
  };

  const results = {
    checkedAt: new Date().toISOString(),
    youtube: null
  };

  // 1. Check YouTube RSS Feed
  if (autoPoster.youtube && autoPoster.youtube.enabled) {
    const channelId = autoPoster.youtube.channelId || process.env.YOUTUBE_CHANNEL_ID || 'UCVXcZwtifEKN_oQItYwFKDg';
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

    try {
      const feedRes = await fetch(feedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(8000)
      });

      if (feedRes.ok) {
        const xml = await feedRes.text();
        const entryMatch = xml.match(/<entry>([\s\S]*?)<\/entry>/);

        if (entryMatch) {
          const entry = entryMatch[1];
          const videoId = (entry.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
          const title = (entry.match(/<title>([^<]+)<\/title>/) || [])[1];
          const link = (entry.match(/<link[^>]+href="([^"]+)"/) || [])[1] || `https://www.youtube.com/watch?v=${videoId}`;
          const published = (entry.match(/<published>([^<]+)<\/published>/) || [])[1];

          const lastId = autoPoster.youtube.lastVideoId;

          if (videoId && videoId !== lastId) {
            // New Video detected! Post to Discord
            console.log(`[AutoPoster] New YouTube video detected: ${title} (${videoId})`);

            await sendDiscordAnnouncement({
              platform: 'youtube',
              title: title,
              link: link,
              message: '🔔 تم نشر فيديو جديد على القناة! شاهد الآن وشاركنا رأيك في التعليقات ✨'
            });

            // Update database state
            autoPoster.youtube.lastVideoId = videoId;
            autoPoster.youtube.lastVideoTitle = title;
            autoPoster.lastAutoPostTime = new Date().toISOString();
            dbObj.data.autoPoster = autoPoster;
            saveDatabase(dbObj);

            results.youtube = {
              status: 'posted',
              videoId,
              title,
              link,
              published
            };
          } else {
            results.youtube = {
              status: 'up-to-date',
              lastVideoId: lastId,
              message: 'لا توجد فيديوهات جديدة غير منشورة'
            };
          }
        } else {
          results.youtube = {
            status: 'no-videos',
            message: 'القناة لا تحتوي على فيديوهات عامة منشورة حتى الآن'
          };
        }
      } else {
        results.youtube = {
          status: 'error',
          code: feedRes.status,
          message: 'تعذر الاتصال بـ RSS Feed الخاص بالقناة'
        };
      }
    } catch (err) {
      console.error('[AutoPoster] Error fetching YouTube feed:', err);
      results.youtube = {
        status: 'error',
        message: err.message
      };
    }
  } else {
    results.youtube = { status: 'disabled' };
  }

  return res.status(200).json({
    success: true,
    results
  });
};
