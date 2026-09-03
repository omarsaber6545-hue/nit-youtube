require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3000,
  ADMIN_PIN: process.env.ADMIN_PIN || "1234",
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || "admin123",
  DISCORD_TOKEN: process.env.DISCORD_TOKEN || "",
  CLIENT_ID: process.env.CLIENT_ID || "",
  GUILD_ID: process.env.GUILD_ID || "", // Optional: for instant guild slash command registration
  DEFAULT_ANNOUNCE_CHANNEL_ID: process.env.ANNOUNCE_CHANNEL_ID || ""
};
