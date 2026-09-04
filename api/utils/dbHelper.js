const fs = require('fs');
const path = require('path');

const ADMIN_PIN = process.env.ADMIN_PIN || '1234';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

function getDatabasePath() {
  const dbPaths = [
    path.join(process.cwd(), 'data/database.json'),
    path.join(__dirname, '../../data/database.json'),
    path.join(__dirname, '../../../data/database.json')
  ];

  for (const p of dbPaths) {
    if (fs.existsSync(p)) return p;
  }
  return path.join(process.cwd(), 'data/database.json');
}

function readDatabase() {
  const p = getDatabasePath();
  try {
    if (fs.existsSync(p)) {
      const raw = fs.readFileSync(p, 'utf8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }

  // Fallback defaults
  return {
    profile: {
      name: "عمر الشامي - Omar Creator",
      handle: "@omar_official",
      bio: "صانع محتوى وفيديوهات مميزة على اليوتيوب والتيك توك والسوشيال ميديا 🚀",
      avatar: "/assets/avatar.png",
      banner: "/assets/avatar.png",
      theme: "red-crimson",
      verified: true,
      location: "Egypt / Arab World",
      email: "contact@creator.com"
    },
    socials: [
      {
        id: "youtube",
        name: "YouTube",
        title: "قناة اليوتيوب الرسمية",
        username: "@horizonservices-dis",
        url: "https://www.youtube.com/@horizonservices-dis",
        icon: "fa-brands fa-youtube",
        color: "#FF0000",
        clicks: 0,
        active: true
      },
      {
        id: "tiktok",
        name: "TikTok",
        title: "حساب التيك توك الرسمي",
        username: "@horizon_services252",
        url: "https://www.tiktok.com/@horizon_services252",
        icon: "fa-brands fa-tiktok",
        color: "#00F2FE",
        clicks: 0,
        active: true
      },
      {
        id: "instagram",
        name: "Instagram",
        title: "حساب الإنستغرام الرسمي",
        username: "@horizon_services251",
        url: "https://www.instagram.com/horizon_services251/",
        icon: "fa-brands fa-instagram",
        color: "#E1306C",
        clicks: 0,
        active: true
      },
      {
        id: "discord",
        name: "Discord",
        title: "مجتمع وسيرفر الديسكورد",
        username: "Horizon Services",
        url: "https://discord.gg/swj6DHy2a",
        icon: "fa-brands fa-discord",
        color: "#5865F2",
        clicks: 0,
        active: true
      }
    ],
    botSettings: {
      announcementChannelId: "1543682822471163974",
      defaultColor: "#5865F2",
      customEmbedTitle: "📢 إشعار جديد من Horizon Services!",
      footerText: "Horizon Services • All Rights Reserved"
    },
    announcements: [],
    analytics: {
      totalPageViews: 0,
      lastVisit: null
    },
    autoPoster: {
      youtube: {
        enabled: true,
        channelId: "UCVXcZwtifEKN_oQItYwFKDg",
        channelUrl: "https://www.youtube.com/@horizonservices-dis",
        lastVideoId: "",
        lastVideoTitle: ""
      },
      tiktok: { enabled: true, username: "@horizon_services252", lastPostId: "" },
      instagram: { enabled: true, username: "@horizon_services251", lastPostId: "" },
      webhookSecret: "horizon_auto_2026",
      lastAutoPostTime: null
    },
    oauth: {
      google: { connected: false },
      tiktok: { connected: false },
      instagram: { connected: false }
    }
  };
}

function writeDatabase(data) {
  const p = getDatabasePath();
  try {
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Failed to write database file:', err);
    return false;
  }
}

function isAuthorized(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  const queryToken = (req.query && req.query.token) ? req.query.token.trim() : '';

  const validTokens = [ADMIN_PIN, ADMIN_PASSWORD, '1234', 'admin123'];
  return validTokens.includes(token) || validTokens.includes(queryToken);
}

function setCorsHeaders(res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );
}

module.exports = {
  ADMIN_PIN,
  ADMIN_PASSWORD,
  readDatabase,
  writeDatabase,
  isAuthorized,
  setCorsHeaders
};
