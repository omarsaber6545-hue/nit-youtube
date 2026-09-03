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
      youtube: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/512px-YouTube_full-color_icon_%282017%29.svg.png',
      tiktok: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/TikTok_logo.svg/512px-TikTok_logo.svg.png',
      instagram: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Instagram_icon.png/512px-Instagram_icon.png',
      facebook: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Facebook_Logo_%282019%29.png/512px-Facebook_Logo_%282019%29.png',
      general: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Speaker_Icon.svg/512px-Speaker_Icon.svg.png'
    };

    const platformLabels = {
      youtube: { name: '🔴 YouTube | يوتيوب', action: 'مشاهدة الفيديو على YouTube 📺' },
      tiktok: { name: '⚫ TikTok | تيك توك', action: 'مشاهدة المقطع على TikTok 🎵' },
      instagram: { name: '🟣 Instagram | إنستغرام', action: 'مشاهدة المنشور على Instagram 📸' },
      facebook: { name: '🔵 Facebook | فيسبوك', action: 'فتح المنشور على Facebook 📘' },
      general: { name: '📢 إشعار عام', action: 'فتح الرابط مباشرة 🔗' }
    };

    const currentPlat = platformLabels[platform] || platformLabels.general;
    const currentIcon = platformIcons[platform] || platformIcons.general;

    // Helper to extract video/post thumbnail
    async function getMediaImage(plat, url) {
      if (!url) return null;
      if (plat === 'youtube' || url.includes('youtu.be') || url.includes('youtube.com')) {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
        return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
      }
      if (plat === 'instagram' || url.includes('instagram.com')) {
        try {
          const shortcodeMatch = url.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
          if (shortcodeMatch && shortcodeMatch[1]) {
            try {
              const embedUrl = `https://www.instagram.com/p/${shortcodeMatch[1]}/embed/captioned/`;
              const embedRes = await fetch(embedUrl, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
                signal: AbortSignal.timeout(6000)
              });
              if (embedRes.ok) {
                const embedHtml = await embedRes.text();
                const embedMatch = embedHtml.match(/class="EmbeddedMediaImage" src="([^"]+)"/) || embedHtml.match(/<img class="[^"]*EmbeddedMediaImage[^"]*"[^>]*src="([^"]+)"/);
                if (embedMatch && embedMatch[1]) return embedMatch[1].replace(/&amp;/g, '&');
              }
            } catch {}
          }
          const res = await fetch(url, {
            headers: {
              'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
              'Accept': 'text/html,application/xhtml+xml,application/xml'
            },
            signal: AbortSignal.timeout(6000)
          });
          if (res.ok) {
            const html = await res.text();
            const match = html.match(/<meta property="og:image" content="([^"]+)"/i) || html.match(/<meta name="twitter:image" content="([^"]+)"/i);
            if (match && match[1]) return match[1].replace(/&amp;/g, '&');
          }
        } catch {}
      }
      if (plat === 'tiktok' || url.includes('tiktok.com')) {
        try {
          const oRes = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(5000) });
          if (oRes.ok) {
            const oData = await oRes.json();
            if (oData.thumbnail_url) return oData.thumbnail_url;
          }
        } catch {}
      }
      return null;
    }

    const postImageUrl = await getMediaImage(platform, link);

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');

    const authorIcon = currentIcon;

    const embed = new EmbedBuilder()
      .setColor(colors[platform] || '#5865F2')
      .setAuthor({
        name: `Horizon Services • ${currentPlat.name}`,
        iconURL: authorIcon
      })
      .setTitle(`✨ ${title}`)
      .setURL(link)
      .setThumbnail(currentIcon)
      .setDescription(
        `${message ? `>>> 💬 **رسالة الإدارة:**\n${message}\n\n` : ''}` +
        `🔗 **الرابط:** [انقر هنا للمشاهدة والتفاعل مباشرة](${link})`
      )
      .setFooter({
        text: `Horizon Services`,
        iconURL: currentIcon
      })
      .setTimestamp();

    if (postImageUrl) {
      embed.setImage(postImageUrl);
    }

    // Interactive Action Buttons
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(currentPlat.action)
        .setURL(link)
        .setStyle(ButtonStyle.Link),
      new ButtonBuilder()
        .setLabel('سيرفر الديسكورد 💬')
        .setURL('https://discord.gg/swj6DHy2a')
        .setStyle(ButtonStyle.Link)
    );

    const dividerPath = path.join(__dirname, '../assets/divider.png');

    const YOUTUBE_ROLE_ID = process.env.YOUTUBE_ROLE_ID || '1543682732486426776';
    const announcementContent = platform === 'youtube'
      ? `## 🔔 فيديو جديد على اليوتيوب | <@&${YOUTUBE_ROLE_ID}>`
      : `## 🔔 إشعار جديد للجميع | @everyone`;

    const sentMessage = await channel.send({
      content: announcementContent,
      embeds: [embed],
      components: [row],
      allowedMentions: {
        parse: ['everyone', 'users'],
        roles: [YOUTUBE_ROLE_ID]
      }
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
