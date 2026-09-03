const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('عرض إحصائيات ونقرات الموقع العام وروابط السوشيال ميديا'),

  async execute(interaction) {
    const analytics = db.getAnalytics();
    const profile = db.getProfile();

    const embed = new EmbedBuilder()
      .setColor('#00F2FE')
      .setTitle(`📊 إحصائيات موقع ${profile.name}`)
      .setDescription(`إجمالي زيارات الموقع: **${analytics.totalPageViews}** زيارة 👁️\nآخر زيارة مسجلة: **${analytics.lastVisit ? new Date(analytics.lastVisit).toLocaleString('ar-EG') : 'لا يوجد'}**`)
      .setThumbnail(profile.avatar)
      .setFooter({ text: 'Social Hub Analytics' })
      .setTimestamp();

    Object.entries(analytics.platformClicks).forEach(([key, val]) => {
      embed.addFields({
        name: `🔗 ${val.name}`,
        value: `**${val.clicks}** نقرة`,
        inline: true
      });
    });

    await interaction.reply({ embeds: [embed] });
  }
};
