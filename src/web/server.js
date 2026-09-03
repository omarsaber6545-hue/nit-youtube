const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('../config');
const db = require('../database/db');
const botService = require('../bot/client');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from both root horizon-web and public folder
app.use(express.static(path.join(__dirname, '../../')));
app.use(express.static(path.join(__dirname, 'public')));

// Simple Auth Middleware for Admin Routes
const requireAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['x-admin-key'];
  if (!authHeader) {
    return res.status(401).json({ error: 'غير مصرح لك بالوصول (رمز المرور مفقود)' });
  }

  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  if (token === config.ADMIN_PIN || token === config.ADMIN_PASSWORD) {
    return next();
  }
  return res.status(403).json({ error: 'رمز المرور غير صحيح' });
};

// ================= PUBLIC API ROUTES ================= //

// Get public profile and active socials
app.get('/api/profile', (req, res) => {
  const profile = db.getProfile();
  const socials = db.getSocials(false);
  const botStatus = botService.getStatus();

  res.json({
    profile,
    socials,
    bot: {
      online: botStatus.online,
      guildsCount: botStatus.guildsCount
    }
  });
});

// Record click on a social platform link
app.post('/api/click/:platform', (req, res) => {
  const { platform } = req.params;
  const clicks = db.recordClick(platform);
  res.json({ success: true, platform, clicks });
});

// Record public page visit
app.post('/api/analytics/view', (req, res) => {
  const total = db.recordPageView();
  res.json({ success: true, totalPageViews: total });
});

// Get current Discord bot status
app.get('/api/bot/status', (req, res) => {
  res.json(botService.getStatus());
});

// ================= ADMIN API ROUTES ================= //

// Admin Login Check
app.post('/api/admin/login', (req, res) => {
  const { password, pin } = req.body;
  const key = (password || pin || '').trim();

  if (key === config.ADMIN_PIN || key === config.ADMIN_PASSWORD) {
    return res.json({ success: true, message: 'تم تسجيل الدخول بنجاح' });
  }
  return res.status(401).json({ success: false, error: 'رمز الدخول أو كلمة المرور غير صحيحة' });
});

// Get all admin management data
app.get('/api/admin/data', requireAuth, (req, res) => {
  const profile = db.getProfile();
  const socials = db.getSocials(true); // Include inactive
  const botSettings = db.getBotSettings();
  const analytics = db.getAnalytics();
  const announcements = db.getAnnouncements();
  const botStatus = botService.getStatus();

  res.json({
    profile,
    socials,
    botSettings,
    analytics,
    announcements,
    botStatus
  });
});

// Update Profile
app.post('/api/admin/profile', requireAuth, (req, res) => {
  const { name, handle, bio, avatar, banner, theme, email, location } = req.body;
  const updated = db.updateProfile({ name, handle, bio, avatar, banner, theme, email, location });
  res.json({ success: true, profile: updated });
});

// Update a specific social platform
app.post('/api/admin/socials/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const updated = db.updateSocial(id, req.body);
  if (updated) {
    return res.json({ success: true, social: updated });
  }
  res.status(404).json({ error: 'المنصة غير موجودة' });
});

// Update all socials list (e.g. reordering or batch update)
app.post('/api/admin/socials', requireAuth, (req, res) => {
  const { socials } = req.body;
  if (!Array.isArray(socials)) {
    return res.status(400).json({ error: 'قائمة الروابط غير صالحة' });
  }
  const updated = db.updateAllSocials(socials);
  res.json({ success: true, socials: updated });
});

// Update Bot Settings
app.post('/api/admin/bot-settings', requireAuth, (req, res) => {
  const { announcementChannelId, defaultColor, customEmbedTitle, footerText } = req.body;
  const updated = db.updateBotSettings({ announcementChannelId, defaultColor, customEmbedTitle, footerText });
  res.json({ success: true, botSettings: updated });
});

// Trigger Discord Announcement from Web Dashboard
app.post('/api/admin/announce', requireAuth, async (req, res) => {
  try {
    const { platform, title, link, message, channelId } = req.body;
    if (!title || !link) {
      return res.status(400).json({ error: 'العنوان والرابط مطلوبان لإرسال الإشعار' });
    }

    const result = await botService.sendAnnouncement({
      platform: platform || 'general',
      title,
      link,
      message,
      channelId
    });

    res.json({ success: true, message: `تم إرسال الإشعار إلى الروم #${result.channelName} بنجاح!` });
  } catch (err) {
    console.error('Error triggering announcement via API:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete Discord Announcement & History Item
app.delete('/api/admin/announcements/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const announcements = db.getAnnouncements();
    const target = announcements.find(a => a.id === id);

    if (!target) {
      return res.status(404).json({ error: 'الإشعار غير موجود' });
    }

    // Try deleting from Discord channel if messageId or dividerMessageId is stored
    if (target.channelId && (target.messageId || target.dividerMessageId)) {
      await botService.deleteAnnouncementMessages({
        channelId: target.channelId,
        messageId: target.messageId,
        dividerMessageId: target.dividerMessageId
      });
    }

    db.deleteAnnouncement(id);
    res.json({ success: true, message: 'تم حذف الرسالة والخط الفاصل من الديسكورد بنجاح! 🗑️' });
  } catch (err) {
    console.error('Error in DELETE announcement route:', err);
    res.status(500).json({ error: err.message });
  }
});

// Catch-all route to serve index.html for unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../', 'index.html'));
});

module.exports = app;
