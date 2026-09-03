const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('facebook')
    .setDescription('عرض صفحة الفيسبوك الرسمية'),

  async execute(interaction) {
    const fb = db.getSocialById('facebook');
    if (!fb || !fb.active) {
      return interaction.reply({ content: '❌ صفحة فيسبوك غير مفعلة حالياً.', ephemeral: true });
    }

    const profile = db.getProfile();
    const embed = new EmbedBuilder()
      .setColor('#1877F2')
      .setTitle(`🔵 صفحة فيسبوك: ${profile.name}`)
      .setURL(fb.url)
      .setDescription(`${fb.description}\n\n**اسم الصفحة:** \`${fb.username}\`\n**المتابعون:** \`${fb.subscribers || 'متزايد'}\``)
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/5968/5968764.png')
      .setFooter({ text: 'لا تنسى تسجيل الإعجاب والمتابعة للصفحة 👍' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('زيارة صفحة الفيسبوك 📘')
        .setURL(fb.url)
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
