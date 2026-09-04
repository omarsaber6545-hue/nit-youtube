const { readDatabase, writeDatabase, setCorsHeaders } = require('../lib/dbHelper');

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const platform = req.query.platform || (req.body && req.body.platform);
  const db = readDatabase();
  const socials = db.socials || [];
  const item = socials.find(s => s.id === platform);

  if (item) {
    item.clicks = (item.clicks || 0) + 1;
    writeDatabase(db);
    return res.json({ success: true, platform, clicks: item.clicks });
  }

  return res.json({ success: true, platform, clicks: 0 });
};
