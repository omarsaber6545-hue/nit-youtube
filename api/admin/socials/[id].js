const { readDatabase, writeDatabase, isAuthorized, setCorsHeaders } = require('../../utils/dbHelper');

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول' });
  }

  const { id } = req.query;
  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  const db = readDatabase();
  const socials = db.socials || [];
  const index = socials.findIndex(s => s.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'المنصة غير موجودة' });
  }

  socials[index] = {
    ...socials[index],
    ...body
  };
  db.socials = socials;

  writeDatabase(db);
  return res.json({ success: true, social: socials[index] });
};
