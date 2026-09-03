const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('../../database/db');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('socials')
    .setDescription('عرض جميع روابط وحسابات السوشيال ميديا الرسمية'),

  async execute(interaction) {
    const profile = db.getProfile();
    const socials = db.getSocials(false);

    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle(`✨ حسابات وسوشيال ميديا ${profile.name}`)
      .setDescription(profile.bio || 'تابعوني على جميع المنصات الرسمية لمواكبة أحدث الفيديوهات والمنشورات!')
      .setThumbnail(profile.avatar)
      .setImage(profile.banner)
      .setFooter({ text: 'اضغط على الأزرار بالأسفل لزيارة الحسابات مباشرة 🌐' })
      .setTimestamp();

    socials.forEach(item => {
      embed.addFields({
        name: `${item.name} (${item.username})`,
        value: `${item.description}\n🔗 [انقر لفتح الرابط](${item.url})`,
        inline: true
      });
    });

    // Create action buttons row (up to 5 buttons per row)
    const rows = [];
    let currentRow = new ActionRowBuilder();
    let count = 0;

    socials.forEach(s => {
      if (count === 5) {
        rows.push(currentRow);
        currentRow = new ActionRowBuilder();
        count = 0;
      }

      let buttonStyle = ButtonStyle.Link;
      currentRow.addComponents(
        new ButtonBuilder()
          .setLabel(s.name)
          .setURL(s.url)
          .setStyle(buttonStyle)
      );
      count++;
    });

    if (count > 0) {
      rows.push(currentRow);
    }

    await interaction.reply({ embeds: [embed], components: rows });
  }
};
