const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tiktok')
    .setDescription('عرض حساب التيك توك الرسمي وأحدث المقاطع'),

  async execute(interaction) {
    const tt = db.getSocialById('tiktok');
    if (!tt || !tt.active) {
      return interaction.reply({ content: '❌ حساب تيك توك غير مفعل حالياً.', ephemeral: true });
    }

    const profile = db.getProfile();
    const embed = new EmbedBuilder()
      .setColor('#00F2FE')
      .setTitle(`⚫ حساب تيك توك: ${profile.name}`)
      .setURL(tt.url)
      .setDescription(`${tt.description}\n\n**اسم المستخدم:** \`${tt.username}\`\n**عدد المتابعين:** \`${tt.subscribers || 'متزايد'}\``)
      .setThumbnail('https://cdn-icons-png.flaticon.com/512/3046/3046121.png')
      .setFooter({ text: 'تابعنا لمشاهدة كواليس ومقاطع قصيرة يومياً ✨' })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('متابعة على TikTok 🎵')
        .setURL(tt.url)
        .setStyle(ButtonStyle.Link)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }
};
