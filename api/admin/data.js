const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const dbPaths = [
    path.join(process.cwd(), 'data/database.json'),
    path.join(__dirname, '../../data/database.json'),
    path.join(__dirname, '../../../data/database.json')
  ];

  for (const p of dbPaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const parsed = JSON.parse(raw);
        return res.json({
          ...parsed,
          botStatus: {
            online: true,
            tag: 'Horizon Services Bot',
            guilds: 1,
            channels: 12,
            ping: 32
          }
        });
      } catch (err) {}
    }
  }

  return res.json({
    botStatus: {
      online: true,
      tag: 'Horizon Services Bot',
      guilds: 1,
      channels: 12,
      ping: 32
    }
  });
};
