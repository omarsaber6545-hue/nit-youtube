/**
 * Vercel Serverless Function / API Endpoint for Publishing Announcements via Discord Bot
 * Reads token securely from process.env.DISCORD_TOKEN or request headers
 */

function getYouTubeThumbnail(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
}

module.exports = async function handler(req, res) {
  // Enable CORS for frontend requests
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { platform, title, link, message, ping, pin, channelId, token: customToken } = req.body || {};

    // Validate PIN (1234)
    const adminPin = (pin || "").toString().trim();
    if (adminPin !== "1234" && req.headers.authorization !== "Bearer 1234" && req.headers.authorization !== "1234") {
      return res.status(401).json({ success: false, error: "رمز المرور غير صحيح (PIN: 1234 مطلوب)" });
    }

    if (!title || !link) {
      return res.status(400).json({ success: false, error: "العنوان والرابط مطلوبان لإرسال الإشعار." });
    }

    // Token retrieved securely from environment or header
    const token = process.env.DISCORD_TOKEN || customToken;
    if (!token) {
      return res.status(500).json({
        success: false,
        error: "DISCORD_TOKEN غير مضبوط في متغيرات البيئة بـ Vercel أو الخادم."
      });
    }

    // Target announcement channel in server (Default: 1543682822471163974 or 1543629395514626177)
    const targetChannelId =
      channelId ||
      process.env.ANNOUNCE_CHANNEL_ID ||
      "1543682822471163974";

    const platformMeta = {
      youtube: { name: "🔴 YouTube | فيديو جديد", color: 16711680, icon: "https://cdn-icons-png.flaticon.com/512/1384/1384060.png" },
      tiktok: { name: "⚫ TikTok | مقطع جديد", color: 62206, icon: "https://cdn-icons-png.flaticon.com/512/3046/3046121.png" },
      instagram: { name: "🟣 Instagram | منشور جديد", color: 14758000, icon: "https://cdn-icons-png.flaticon.com/512/2111/2111463.png" },
      facebook: { name: "🔵 Facebook | منشور جديد", color: 1603570, icon: "https://cdn-icons-png.flaticon.com/512/5968/5968764.png" },
      general: { name: "📢 إشعار وتنبيه جديد", color: 15024404, icon: "https://cdn-icons-png.flaticon.com/512/3602/3602145.png" }
    };

    const meta = platformMeta[platform] || platformMeta.general;

    let content = "";
    if (ping === "everyone") {
      content = "🔔 **إشعار جديد للجميع | @everyone**\n> 🚀 **تم نشر محتوى جديد ومميز! تفقد التفاصيل بالأسفل:**";
    } else if (ping === "youtube_role") {
      content = "🔔 **إشعار جديد لمتابعي اليوتيوب!**\n> 📺 **فيديو جديد نزل الآن! شاهد الرابط بالأسفل:**";
    }

    const embed = {
      title: `✨ ${title}`,
      url: link,
      color: meta.color,
      author: {
        name: `Horizon Services • ${meta.name}`,
        icon_url: meta.icon
      },
      description:
        `${message ? `>>> 💬 **رسالة الإدارة:**\n${message}\n\n` : ""}` +
        `🔗 **الرابط:** [انقر هنا للمشاهدة والتفاعل مباشرة](${link})`,
      footer: {
        text: "Horizon Services • نظام النشر الآلي المعتمد",
        icon_url: meta.icon
      },
      timestamp: new Date().toISOString()
    };

    if (platform === "youtube") {
      const ytThumb = getYouTubeThumbnail(link);
      if (ytThumb) {
        embed.image = { url: ytThumb };
      }
    }

    const discordPayload = {
      content: content || undefined,
      embeds: [embed]
    };

    // Dispatch directly to Discord REST API via Bot Token
    const discordUrl = `https://discord.com/api/v10/channels/${targetChannelId}/messages`;
    const discordRes = await fetch(discordUrl, {
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(discordPayload)
    });

    const resData = await discordRes.json();

    if (!discordRes.ok) {
      return res.status(discordRes.status).json({
        success: false,
        error: resData.message || "فشل إرسال الرسالة إلى الديسكورد عبر البوت",
        details: resData
      });
    }

    return res.status(200).json({
      success: true,
      message: "تم نشر الإشعار في سيرفر الديسكورد عبر البوت بنجاح! 🚀",
      messageId: resData.id
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `حدث خطأ غير متوقع: ${err.message}`
    });
  }
};
