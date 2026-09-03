const config = require('./config');
const app = require('./web/server');
const botService = require('./bot/client');

const PORT = config.PORT;

// Start Express Web Server
const server = app.listen(PORT, () => {
  console.log('====================================================');
  console.log(`🚀 [Web Server] Social Hub is running on: http://localhost:${PORT}`);
  console.log(`⚙️  [Admin Panel] Control Dashboard: http://localhost:${PORT}/admin.html`);
  console.log('====================================================');
});

// Initialize Discord Bot
botService.init();

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  if (botService.client) {
    botService.client.destroy();
  }
  server.close(() => {
    console.log('✅ Servers closed successfully.');
    process.exit(0);
  });
});
