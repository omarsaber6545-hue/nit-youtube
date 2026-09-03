const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('announce')
    .setDescription('إرسال إشعار لمنشور أو فيديو جديد في روم محدد')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('المنصة (youtube, tiktok, instagram, facebook)')
        .setRequired(true)
        .addChoices(
          { name: '🔴 YouTube', value: 'youtube' },
          { name: '⚫ TikTok', value: 'tiktok' },
          { name: '🟣 Instagram', value: 'instagram' },
          { name: '🔵 Facebook', value: 'facebook' },
          { name: '📢 عام / General', value: 'general' }
        )
    )
    .addStringOption(option =>
      option.setName('title')
        .setDescription('عنوان الإشعار أو المنشور')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('link')
        .setDescription('رابط المنشور أو الفيديو الجديد')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('message')
        .setDescription('وصف أو رسالة إضافية')
        .setRequired(false)
    )
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('الروم المراد نشر الإشعار فيه (اختياري، يختار الروم الحالي افتراضياً)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const platform = interaction.options.getString('platform');
    const title = interaction.options.getString('title');
    const link = interaction.options.getString('link');
    const message = interaction.options.getString('message') || 'تم نشر محتوى جديد! تفقد الرابط الآن:';
    const targetChannel = interaction.options.getChannel('channel') || interaction.channel;

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

    function getYouTubeThumbnail(url) {
      if (!url) return null;
      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
      return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
    }

    const ytThumbnail = platform === 'youtube' ? getYouTubeThumbnail(link) : null;

    const { ActionRowBuilder, ButtonBuilder, ButtonStyle, AttachmentBuilder } = require('discord.js');
    const path = require('path');
    const fs = require('fs');

    const authorIcon = (profile.avatar && profile.avatar.startsWith('http'))
      ? profile.avatar
      : (interaction.client.user.displayAvatarURL() || 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png');

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
        text: `Social Hub • إشعار فوري 🚀`,
        iconURL: 'https://cdn-icons-png.flaticon.com/512/3602/3602145.png'
      })
      .setTimestamp();

    if (ytThumbnail) {
      embed.setImage(ytThumbnail);
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel(currentPlat.action)
        .setURL(link)
        .setStyle(ButtonStyle.Link)
    );

    try {
      const dividerPath = path.join(__dirname, '../../assets/divider.png');
      const announcementContent = `## 🔔 إشعار جديد للجميع | @everyone\n> 🚀 **تم نشر محتوى جديد ومميز! تفقد التفاصيل بالأسفل:**`;

      await targetChannel.send({
        content: announcementContent,
        embeds: [embed],
        components: [row]
      });

      if (fs.existsSync(dividerPath)) {
        const dividerAttachment = new AttachmentBuilder(dividerPath, { name: 'divider.png' });
        await targetChannel.send({ files: [dividerAttachment] });
      }
      
      // Record announcement in DB
      db.addAnnouncement({
        platform,
        title,
        link,
        message,
        channelName: targetChannel.name,
        channelId: targetChannel.id,
        sentBy: interaction.user.tag
      });

      await interaction.reply({
        content: `✅ تم نشر الإشعار بنجاح في <#${targetChannel.id}>`,
        ephemeral: true
      });
    } catch (err) {
      console.error('Error sending announcement:', err);
      await interaction.reply({
        content: `❌ حدث خطأ أثناء إرسال الإشعار: ${err.message}`,
        ephemeral: true
      });
    }
  }
};
