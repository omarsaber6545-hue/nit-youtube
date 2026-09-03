const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config');

async function registerCommands(token, clientId, guildId = null) {
  if (!token || !clientId) {
    console.log('⚠️ [Discord Bot] Discord Token or Client ID is missing. Skipping command registration.');
    return;
  }

  const commands = [];
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
    }
  }

  const rest = new REST().setToken(token);

  try {
    console.log(`⏳ [Discord Bot] Started refreshing ${commands.length} application (/) commands...`);

    let data;
    if (guildId) {
      // Register for specific guild (instant update for testing)
      data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands }
      );
      console.log(`✅ [Discord Bot] Successfully registered ${data.length} commands to guild: ${guildId}`);
    } else {
      // Register globally
      data = await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
      );
      console.log(`✅ [Discord Bot] Successfully registered ${data.length} global commands.`);
    }
  } catch (error) {
    console.error('❌ [Discord Bot] Error while registering commands:', error.message);
  }
}

module.exports = registerCommands;
