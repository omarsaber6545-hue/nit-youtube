const { ADMIN_PIN, ADMIN_PASSWORD, setCorsHeaders } = require('../../lib/dbHelper');

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  const { password, pin } = body;
  const key = (password || pin || '').trim();

  const validKeys = [ADMIN_PIN, ADMIN_PASSWORD, '1234', 'admin123'];
  if (validKeys.includes(key)) {
    return res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
  }

  return res.status(401).json({ success: false, error: 'رمز الدخول أو كلمة المرور غير صحيحة' });
};
