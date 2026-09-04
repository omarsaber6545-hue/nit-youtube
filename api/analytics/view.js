const { readDatabase, writeDatabase, setCorsHeaders } = require('../utils/dbHelper');

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const db = readDatabase();
  db.analytics = db.analytics || { totalPageViews: 0 };
  db.analytics.totalPageViews = (db.analytics.totalPageViews || 0) + 1;
  db.analytics.lastVisit = new Date().toISOString();

  writeDatabase(db);
  return res.json({ success: true, totalPageViews: db.analytics.totalPageViews });
};
