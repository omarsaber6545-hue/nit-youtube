const { readDatabase, writeDatabase, isAuthorized, setCorsHeaders } = require('../../lib/dbHelper');

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  const db = readDatabase();
  db.botSettings = {
    ...(db.botSettings || {}),
    ...body
  };

  writeDatabase(db);
  return res.json({ success: true, botSettings: db.botSettings });
};
