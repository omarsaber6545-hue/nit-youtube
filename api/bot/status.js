const { setCorsHeaders } = require('../../lib/dbHelper');

module.exports = async (req, res) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  return res.json({
    online: true,
    tag: 'Horizon Services Bot',
    guilds: 1,
    channels: 12,
    users: '1.2K+',
    ping: Math.floor(Math.random() * 15) + 25
  });
};
