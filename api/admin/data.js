const { readDatabase, isAuthorized, setCorsHeaders } = require('../../lib/dbHelper');

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول. يرجى تسجيل الدخول برمز المرور' });
  }

  const db = readDatabase();

  return res.json({
    profile: db.profile || {},
    socials: db.socials || [],
    botSettings: db.botSettings || {},
    analytics: db.analytics || { totalPageViews: 0, lastVisit: null },
    announcements: db.announcements || [],
    botStatus: {
      online: true,
      tag: 'Horizon Services Bot',
      guilds: 1,
      channels: 10,
      ping: 42
    }
  });
};
