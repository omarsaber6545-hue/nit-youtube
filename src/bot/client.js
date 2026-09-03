const { Client, GatewayIntentBits, Collection, ActivityType, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const db = require('../database/db');
const registerCommands = require('./registerCommands');

class BotService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.commands = new Collection();
  }

  init() {
    if (!config.DISCORD_TOKEN) {
      console.log('ℹ️ [Discord Bot] DISCORD_TOKEN is not set in .env. Bot is in standby mode.');
      console.log('👉 You can add DISCORD_TOKEN and CLIENT_ID in .env file to enable the Discord Bot.');
      return;
    }

    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
      ]
    });

    this.loadCommands();
    this.setupEvents();

    this.client.login(config.DISCORD_TOKEN).catch(err => {
      console.error('❌ [Discord Bot] Login failed:', err.message);
      this.isReady = false;
    });
  }

  loadCommands() {
    this.commands.clear();
    const commandsPath = path.join(__dirname, 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const filePath = path.join(commandsPath, file);
      const command = require(filePath);
      if ('data' in command && 'execute' in command) {
        this.commands.set(command.data.name, command);
      }
    }
  }

  setupEvents() {
    this.client.once('ready', async () => {
      this.isReady = true;
      console.log(`🤖 [Discord Bot] Logged in as ${this.client.user.tag}! Connected to ${this.client.guilds.cache.size} server(s).`);

      // Register slash commands
      if (config.CLIENT_ID) {
        await registerCommands(config.DISCORD_TOKEN, config.CLIENT_ID, config.GUILD_ID);
      }

      // Start presence cycling
      this.startPresenceCycle();
    });

    this.client.on('interactionCreate', async interaction => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(`❌ [Discord Bot] Error executing /${interaction.commandName}:`, error);
        const replyContent = { content: '⚠️ حدث خطأ أثناء تنفيذ هذا الأمر!', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(replyContent);
        } else {
          await interaction.reply(replyContent);
        }
      }
    });

    this.client.on('error', err => {
      console.error('⚠️ [Discord Bot Error]:', err.message);
    });
  }

  startPresenceCycle() {
    const activities = [
      { name: '🔗 /socials for all links', type: ActivityType.Playing },
      { name: '🔴 YouTube videos', type: ActivityType.Watching },
      { name: '🎵 TikTok short clips', type: ActivityType.Watching },
      { name: '📸 Instagram updates', type: ActivityType.Watching },
      { name: '🌐 Social Web Hub', type: ActivityType.Listening }
    ];

    let current = 0;
    setInterval(() => {
      if (this.client && this.isReady) {
        this.client.user.setActivity(activities[current]);
        current = (current + 1) % activities.length;
      }
    }, 15000);
  }

  // Method to send an announcement from web dashboard
  async sendAnnouncement({ platform, title, link, message, channelId }) {
    if (!this.isReady || !this.client) {
      throw new Error('بوت الديسكورد غير متصل حالياً! تأكد من إعداد التوكن.');
    }

    const targetChannelId = channelId || db.getBotSettings().announcementChannelId || config.DEFAULT_ANNOUNCE_CHANNEL_ID;
    if (!targetChannelId) {
      throw new Error('لم يتم تحديد روم الإعلانات (Channel ID) في لوحة التحكم أو ملف الإعدادات.');
    }

    const channel = await this.client.channels.fetch(targetChannelId).catch(() => null);
    if (!channel) {
      throw new Error(`تعذر العثور على الروم بالمعرف: ${targetChannelId}. تأكد من صلاحيات البوت.`);
    }

    const profile = db.getProfile();

    const colors = {
      youtube: '#FF0000',
      tiktok: '#00F2FE',
      instagram: '#E1306C',
      facebook: '#1877F2',
      general: '#5865F2'
    };

    const platformIcons = {
      youtube: 'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
      tiktok: 'https://cdn-icons-png.flaticon.com/512/3046/3046121.png',
      instagram: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png',
      facebook: 'https://cdn-icons-png.flaticon.com/512/5968/5968764.png',
      general: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png'
    };

    const platformLabels = {
      youtube: { name: '🔴 YouTube | يوتيوب', action: 'مشاهدة الفيديو على YouTube 📺' },
      tiktok: { name: '⚫ TikTok | تيك توك', action: 'مشاهدة المقطع على TikTok 🎵' },
      instagram: { name: '🟣 Instagram | إنستغرام', action: 'مشاهدة المنشور على Instagram 📸' },
      facebook: { name: '🔵 Facebook | فيسبوك', action: 'فتح المنشور على Facebook 📘' },
      general: { name: '📢 إشعار عام', action: 'فتح الرابط مباشرة 🔗' }
    };

    const currentPlat = platformLabels[platform] || platformLabels.general;

    // Helper to extract YouTube video thumbnail
    function getYouTubeThumbnail(url) {
      if (!url) return null;
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
    }

    const ytThumbnail = platform === 'youtube' ? getYouTubeThumbnail(link) : null;

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');

    const authorIcon = (profile.avatar && profile.avatar.startsWith('http'))
      ? profile.avatar
      : (this.client.user.displayAvatarURL() || 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png');

    const embed = new EmbedBuilder()
      .setColor(colors[platform] || '#5865F2')
      .setAuthor({
        name: `${profile.name} • إشعار جديد 🚀`,
        iconURL: authorIcon
      })
      .setTitle(`✨ ${title}`)
      .setURL(link)
      .setThumbnail(platformIcons[platform] || platformIcons.general)
      .setDescription(
        `${message ? `>>> 💬 **رسالة صانع المحتوى:**\n${message}\n\n` : ''}` +
        `🔗 **الرابط:** [انقر هنا للمشاهدة والتفاعل مباشرة](${link})`
      )
      .setFooter({
        text: `Social Hub • إشعار تلقائي فوري`,
        iconURL: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png'
      })
      .setTimestamp();

    if (ytThumbnail) {
      embed.setImage(ytThumbnail);
    }

    // Interactive Action Buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(currentPlat.action)
        .setURL(link)
        .setStyle(ButtonStyle.Link)
    );

    const dividerPath = path.join(__dirname, '../assets/divider.png');

    const announcementContent = `## 🔔 إشعار جديد للجميع | @everyone\n> 🚀 **تم نشر محتوى جديد ومميز! تفقد التفاصيل بالأسفل:**`;

    const sentMessage = await channel.send({
      content: announcementContent,
      embeds: [embed],
      components: [row]
    });

    let dividerMessage = null;
    if (fs.existsSync(dividerPath)) {
      const dividerAttachment = new AttachmentBuilder(dividerPath, { name: 'divider.png' });
      dividerMessage = await channel.send({ files: [dividerAttachment] });
    }

    db.addAnnouncement({
      platform,
      title,
      link,
      message,
      channelName: channel.name,
      channelId: channel.id,
      messageId: sentMessage ? sentMessage.id : null,
      dividerMessageId: dividerMessage ? dividerMessage.id : null,
      sentBy: 'Web Dashboard'
    });

    return { success: true, channelName: channel.name };
  }

  // Method to delete an announcement message and its divider line from Discord
  async deleteAnnouncementMessages({ channelId, messageId, dividerMessageId }) {
    if (!this.isReady || !this.client) {
      console.log('⚠️ [Discord Bot] Bot is not ready to delete messages.');
      return;
    }

    if (!channelId) return;

    try {
      const channel = await this.client.channels.fetch(channelId).catch(() => null);
      if (!channel) return;

      if (messageId) {
        await channel.messages.delete(messageId).catch(err => {
          console.log(`ℹ️ [Discord Bot] Could not delete message ${messageId}:`, err.message);
        });
      }

      if (dividerMessageId) {
        await channel.messages.delete(dividerMessageId).catch(err => {
          console.log(`ℹ️ [Discord Bot] Could not delete divider message ${dividerMessageId}:`, err.message);
        });
      }
    } catch (err) {
      console.error('❌ [Discord Bot] Error in deleteAnnouncementMessages:', err.message);
    }
  }

  getStatus() {
    if (!this.client || !this.isReady) {
      return {
        online: false,
        tag: null,
        ping: null,
        guildsCount: 0
      };
    }

    return {
      online: true,
      tag: this.client.user.tag,
      avatar: this.client.user.displayAvatarURL(),
      ping: Math.round(this.client.ws.ping),
      guildsCount: this.client.guilds.cache.size,
      guilds: this.client.guilds.cache.map(g => ({ id: g.id, name: g.name }))
    };
  }
}

const botService = new BotService();
module.exports = botService;
