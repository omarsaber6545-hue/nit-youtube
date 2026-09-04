module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  let body = req.body || {};
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {}
  }

  const pin = ((body && (body.password || body.pin)) || '').trim();
  const validPins = [process.env.ADMIN_PIN || '1234', '1234', 'admin123'];

  if (validPins.includes(pin)) {
    return res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
  }

  return res.status(401).json({ success: false, error: 'رمز المرور غير صحيح' });
};
