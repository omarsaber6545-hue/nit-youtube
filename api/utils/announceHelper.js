const fs = require('fs');
const path = require('path');

// Default fallback token
const DEFAULT_TOKEN = Buffer.from(
  'TVRVME16WTNPRE0yT1RRM05EazBOVEE0TmcuR01KR3lELlF4VDBpa0xTT1E3UXRkWGtacTlvLVdVUm9xMzRtS2ZGaWw2cmgw',
  'base64'
).toString('utf-8');

const TOKEN = process.env.DISCORD_TOKEN || DEFAULT_TOKEN;
const DEFAULT_CHANNEL_ID = process.env.ANNOUNCE_CHANNEL_ID || '1543682822471163974';
const DEFAULT_YOUTUBE_ROLE_ID = process.env.YOUTUBE_ROLE_ID || '1543682732486426776';

async function getMediaImage(platform, url) {
  if (!url) return null;

  // 1. YouTube video thumbnail
  if (platform === 'youtube' || url.includes('youtu.be') || url.includes('youtube.com')) {
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    if (match && match[1]) {
      return { url: `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` };
    }
  }

  // 2. Instagram post / reel / tv preview image
  if (platform === 'instagram' || url.includes('instagram.com')) {
    try {
      const shortcodeMatch = url.match(/\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
      let targetImgUrl = null;

      if (shortcodeMatch && shortcodeMatch[1]) {
        try {
          const embedUrl = `https://www.instagram.com/p/${shortcodeMatch[1]}/embed/captioned/`;
          const embedRes = await fetch(embedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            signal: AbortSignal.timeout(6000)
          });
          if (embedRes.ok) {
            const embedHtml = await embedRes.text();
            const embedMatch =
              embedHtml.match(/class="EmbeddedMediaImage" src="([^"]+)"/) ||
              embedHtml.match(/<img class="[^"]*EmbeddedMediaImage[^"]*"[^>]*src="([^"]+)"/);
            if (embedMatch && embedMatch[1]) {
              targetImgUrl = embedMatch[1].replace(/&amp;/g, '&');
            }
          }
        } catch {}
      }

      if (!targetImgUrl) {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
            'Accept': 'text/html,application/xhtml+xml,application/xml'
          },
          signal: AbortSignal.timeout(6000)
        });
        if (res.ok) {
          const html = await res.text();
          const match =
            html.match(/<meta property="og:image" content="([^"]+)"/i) ||
            html.match(/<meta name="twitter:image" content="([^"]+)"/i);
          if (match && match[1]) {
            targetImgUrl = match[1].replace(/&amp;/g, '&');
          }
        }
      }

      if (targetImgUrl) {
        try {
          const imgRes = await fetch(targetImgUrl, { signal: AbortSignal.timeout(8000) });
          if (imgRes.ok) {
            const buffer = await imgRes.arrayBuffer();
            return { buffer, filename: 'post_image.jpg' };
          }
        } catch {}
        return { url: targetImgUrl };
      }
    } catch (err) {
      console.error('Instagram thumbnail fetch error:', err.message);
    }
  }

  // 3. TikTok video thumbnail
  if (platform === 'tiktok' || url.includes('tiktok.com')) {
    try {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const res = await fetch(oembedUrl, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.thumbnail_url) {
          try {
            const imgRes = await fetch(data.thumbnail_url, { signal: AbortSignal.timeout(6000) });
            if (imgRes.ok) {
              const buffer = await imgRes.arrayBuffer();
              return { buffer, filename: 'post_image.jpg' };
            }
          } catch {}
          return { url: data.thumbnail_url };
        }
      }
    } catch (err) {
      console.error('TikTok thumbnail fetch error:', err.message);
    }
  }

  // 4. Direct image link
  if (url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
    return { url };
  }

  return null;
}

async function sendDiscordAnnouncement({
  platform = 'general',
  title,
  link,
  message = '',
  channelId = DEFAULT_CHANNEL_ID,
  youtubeRoleId = DEFAULT_YOUTUBE_ROLE_ID,
  token = TOKEN
}) {
  if (!title || !link) {
    throw new Error('العنوان والرابط مطلوبان لإرسال الإشعار');
  }

  let cleanLink = link.trim();
  if (!cleanLink.startsWith('http://') && !cleanLink.startsWith('https://')) {
    cleanLink = 'https://' + cleanLink;
  }

  const platformColors = {
    youtube: 16711680,   // Red
    tiktok: 62206,       // Cyan
    instagram: 14758000, // Magenta
    facebook: 1603570,   // Blue
    general: 15024404    // Crimson
  };

  const platformLabels = {
    youtube: '🔴 YouTube | فيديو جديد',
    tiktok: '⚫ TikTok | مقطع جديد',
    instagram: '🟣 Instagram | منشور جديد',
    facebook: '🔵 Facebook | منشور جديد',
    general: '📢 إشعار وتنبيه جديد'
  };

  // Load platform icon buffer
  let iconBuffer = null;
  const iconFilename = `${platform}.png`;
  const iconLocalPaths = [
    path.join(process.cwd(), `src/assets/icons/${iconFilename}`),
    path.join(__dirname, `../../src/assets/icons/${iconFilename}`),
    path.join(__dirname, `../../../src/assets/icons/${iconFilename}`),
    path.join(__dirname, `../src/assets/icons/${iconFilename}`)
  ];
  for (const p of iconLocalPaths) {
    if (fs.existsSync(p)) {
      iconBuffer = fs.readFileSync(p);
      break;
    }
  }

  if (!iconBuffer) {
    try {
      const iconRes = await fetch(
        `https://raw.githubusercontent.com/omarsaber6545-hue/nit-youtube/main/src/assets/icons/${iconFilename}`
      );
      if (iconRes.ok) iconBuffer = await iconRes.arrayBuffer();
    } catch {}
  }

  const iconUrl = iconBuffer
    ? 'attachment://icon.png'
    : 'https://raw.githubusercontent.com/walkxcode/dashboard-icons/main/png/youtube.png';

  const embed = {
    title: `✨ ${title.trim()}`,
    url: cleanLink,
    color: platformColors[platform] || platformColors.general,
    author: {
      name: `Horizon Services • ${platformLabels[platform] || platformLabels.general}`,
      icon_url: iconUrl
    },
    thumbnail: {
      url: iconUrl
    },
    description: `${message ? `>>> 💬 **رسالة الإدارة:**\n${message.trim()}\n\n` : ''}🔗 **الرابط:** [انقر هنا للمشاهدة والتفاعل مباشرة](${cleanLink})`,
    footer: {
      text: 'Horizon Services • Auto Announcer',
      icon_url: iconUrl
    },
    timestamp: new Date().toISOString()
  };

  const mediaResult = await getMediaImage(platform, cleanLink);
  let postImageBuffer = null;

  if (mediaResult) {
    if (mediaResult.buffer) {
      postImageBuffer = mediaResult.buffer;
      embed.image = { url: 'attachment://post_image.jpg' };
    } else if (mediaResult.url) {
      embed.image = { url: mediaResult.url };
    }
  }

  const mentionHeader = platform === 'youtube'
    ? `## 🔔 فيديو جديد على اليوتيوب | <@&${youtubeRoleId}>`
    : '## 🔔 إشعار جديد للجميع | @everyone';

  const messagePayload = {
    content: mentionHeader,
    embeds: [embed],
    allowed_mentions: {
      parse: ['everyone', 'users'],
      roles: [youtubeRoleId]
    },
    components: [
      {
        type: 1,
        components: [
          {
            type: 2,
            style: 5,
            label: 'انقر لفتح الرابط والمشاهدة 🔗',
            url: cleanLink
          },
          {
            type: 2,
            style: 5,
            label: 'سيرفر الديسكورد 💬',
            url: 'https://discord.gg/swj6DHy2a'
          }
        ]
      }
    ]
  };

  let discordResStatus = 0;
  let discordResBody = '';
  let sentMessageId = null;

  if (iconBuffer || postImageBuffer) {
    const formData = new FormData();
    formData.append('payload_json', JSON.stringify(messagePayload));

    let fileIdx = 0;
    if (iconBuffer) {
      const blob = new Blob([iconBuffer], { type: 'image/png' });
      formData.append(`files[${fileIdx++}]`, blob, 'icon.png');
    }
    if (postImageBuffer) {
      const postBlob = new Blob([postImageBuffer], { type: 'image/jpeg' });
      formData.append(`files[${fileIdx++}]`, postBlob, 'post_image.jpg');
    }

    const dRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`
      },
      body: formData
    });
    discordResStatus = dRes.status;
    discordResBody = await dRes.text();
  } else {
    const jsonPayload = JSON.stringify(messagePayload);
    const dRes = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${token}`,
        'Content-Type': 'application/json'
      },
      body: jsonPayload
    });
    discordResStatus = dRes.status;
    discordResBody = await dRes.text();
  }

  if (discordResStatus < 200 || discordResStatus >= 300) {
    throw new Error(`Discord API error (${discordResStatus}): ${discordResBody}`);
  }

  try {
    const parsed = JSON.parse(discordResBody);
    sentMessageId = parsed.id;
  } catch {}

  // Send Divider Line as a native file attachment
  try {
    let fileBuffer = null;
    const localPaths = [
      path.join(process.cwd(), 'src/assets/divider.png'),
      path.join(__dirname, '../../src/assets/divider.png'),
      path.join(__dirname, '../../../src/assets/divider.png'),
      path.join(__dirname, '../src/assets/divider.png')
    ];
    for (const p of localPaths) {
      if (fs.existsSync(p)) {
        fileBuffer = fs.readFileSync(p);
        break;
      }
    }

    if (!fileBuffer) {
      const rawRes = await fetch('https://raw.githubusercontent.com/omarsaber6545-hue/nit-youtube/main/src/assets/divider.png');
      if (rawRes.ok) {
        fileBuffer = await rawRes.arrayBuffer();
      }
    }

    if (fileBuffer) {
      const blob = new Blob([fileBuffer], { type: 'image/png' });
      const formData = new FormData();
      formData.append('files[0]', blob, 'divider.png');

      await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bot ${token}`
        },
        body: formData
      });
    }
  } catch (divErr) {
    console.error('Divider send error:', divErr);
  }

  return {
    success: true,
    messageId: sentMessageId,
    channelId
  };
}

module.exports = {
  getMediaImage,
  sendDiscordAnnouncement
};
