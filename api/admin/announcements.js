const { readDatabase, writeDatabase, isAuthorized, setCorsHeaders } = require('../../lib/dbHelper');

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول' });
  }

  const db = readDatabase();

  if (req.method === 'GET') {
    return res.json({ success: true, announcements: db.announcements || [] });
  }

  if (req.method === 'DELETE') {
    const id = req.query.id || (req.body && req.body.id);
    if (!id) {
      return res.status(400).json({ error: 'معرف الإشعار مطلوب' });
    }

    const list = db.announcements || [];
    const filtered = list.filter(a => a.id !== id);

    if (filtered.length === list.length) {
      return res.status(404).json({ error: 'الإشعار غير موجود' });
    }

    db.announcements = filtered;
    writeDatabase(db);
    return res.json({ success: true, message: 'تم حذف الإشعار بنجاح' });
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
};
