const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('عرض رابط قناة اليوتيوب الرسمية وأحدث الفيديوهات'),

  async execute(interaction) {
    const yt = db.getSocialById('youtube');
    if (!yt || !yt.active) {
      return interaction.reply({ content: '❌ حساب اليوتيوب غير مفعل حالياً.', ephemeral: true });
    }

    const profile = db.getProfile();
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle(`🔴 قناة يوتيوب: ${profile.name}`)
      .setURL(yt.url)
      .setDescription(`${yt.description}\n\n**اسم المستخدم:** \`${yt.username}\`\n**عدد المشتركين التقريبي:** \`${yt.subscribers || 'متزايد'}\``)
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/1384/1384060.png')
      .setFooter({ text: 'لا تنسى الاشتراك وتفعيل زر الجرس 🔔' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('الذهاب إلى القناة 📺')
        .setURL(yt.url)
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
