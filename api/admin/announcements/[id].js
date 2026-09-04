const { readDatabase, writeDatabase, isAuthorized, setCorsHeaders } = require('../../utils/dbHelper');

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  if (!isAuthorized(req)) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول' });
  }

  const { id } = req.query;
  const db = readDatabase();
  const announcements = db.announcements || [];
  const filtered = announcements.filter(a => a.id !== id);

  if (filtered.length === announcements.length) {
    return res.status(404).json({ error: 'الإشعار غير موجود' });
  }

  db.announcements = filtered;
  writeDatabase(db);

  return res.json({ success: true, message: 'تم حذف الإشعار بنجاح' });
};
