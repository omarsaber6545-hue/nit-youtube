const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('instagram')
    .setDescription('عرض حساب الإنستغرام الرسمي'),

  async execute(interaction) {
    const ig = db.getSocialById('instagram');
    if (!ig || !ig.active) {
      return interaction.reply({ content: '❌ حساب انستغرام غير مفعل حالياً.', ephemeral: true });
    }

    const profile = db.getProfile();
    const embed = new EmbedBuilder()
      .setColor('#E1306C')
      .setTitle(`🟣 حساب إنستغرام: ${profile.name}`)
      .setURL(ig.url)
      .setDescription(`${ig.description}\n\n**اسم المستخدم:** \`${ig.username}\`\n**المتابعون:** \`${ig.subscribers || 'متزايد'}\``)
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/2111/2111463.png')
      .setFooter({ text: 'شاهد الستوريات وتفاعل معنا أولاً بأول 📸' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('زيارة الإنستغرام 📸')
        .setURL(ig.url)
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
