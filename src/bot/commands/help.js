const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('دليل أوامر بوت السوشيال ميديا'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📖 قائمة أوامر البوت')
      .setDescription('إليك جميع الأوامر المتاحة في البوت لمتابعة حسابات السوشيال ميديا:')
      .addFields(
        { name: '🌐 `/socials`', value: 'عرض جميع المنصات والحسابات الرسمية بأزرار تفاعلية.' },
        { name: '🔴 `/youtube`', value: 'عرض رابط قناة اليوتيوب وأحدث الفيديوهات.' },
        { name: '⚫ `/tiktok`', value: 'عرض حساب التيك توك والمقاطع القصيرة.' },
        { name: '🟣 `/instagram`', value: 'عرض حساب الإنستغرام والستوريات.' },
        { name: '🔵 `/facebook`', value: 'عرض صفحة الفيسبوك الرسمية.' },
        { name: '📊 `/stats`', value: 'عرض إحصائيات النقرات وزيارات الموقع.' },
        { name: '📢 `/announce`', value: '*(للإدارة)* نشر إشعار فوري لفيديو أو منشور جديد في الروم.' }
      )
      .setFooter({ text: 'Social Discord Hub • تم التطوير بدقة واحترافية' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
