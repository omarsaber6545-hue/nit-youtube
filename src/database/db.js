const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/database.json');

// Default initial database state
const DEFAULT_DATA = {
  profile: {
    name: "Creator Name",
    handle: "@creator",
    bio: "مرحباً بكم في صفحتي الرسمية! تابعوني على جميع منصات التواصل الاجتماعي للمزيد من المحتوى المميز والحصري 🚀",
    avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&auto=format&fit=crop&q=80",
    banner: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&auto=format&fit=crop&q=80",
    theme: "cyberpunk", // cyberpunk, neon-purple, ocean-blue, emerald, sunset
    verified: true,
    location: "Egypt / Arab World",
    email: "contact@creator.com"
  },
  socials: [
    {
      id: "youtube",
      name: "YouTube",
      title: "قناة اليوتيوب الرسمية",
      username: "@horizonservices-dis",
      url: "https://www.youtube.com/@horizonservices-dis",
      icon: "fa-brands fa-youtube",
      color: "#FF0000",
      gradient: "linear-gradient(135deg, #FF0000, #b30000)",
      description: "فيديوهات وشروحات وتحديثات برمجية حصرية من Horizon Services!",
      subscribers: "Horizon Community",
      clicks: 0,
      active: true,
      featuredVideoId: "dQw4w9WgXcQ" // Example YouTube Video ID for embed
    },
    {
      id: "tiktok",
      name: "TikTok",
      title: "حساب التيك توك الرسمي",
      username: "@horizon_services252",
      url: "https://www.tiktok.com/@horizon_services252",
      icon: "fa-brands fa-tiktok",
      color: "#00F2FE",
      gradient: "linear-gradient(135deg, #00F2FE, #FE0979)",
      description: "مقاطع قصيرة، شروحات وكواليس ممتعة كل يوم!",
      subscribers: "Horizon Community",
      clicks: 0,
      active: true
    },
    {
      id: "instagram",
      name: "Instagram",
      title: "حساب الإنستغرام",
      username: "@CreatorInsta",
      url: "https://instagram.com",
      icon: "fa-brands fa-instagram",
      color: "#E1306C",
      gradient: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
      description: "صور يومية، ستوريات وتفاعل مباشر معكم 📸",
      subscribers: "80K+",
      clicks: 0,
      active: true
    },
    {
      id: "facebook",
      name: "Facebook",
      title: "صفحة الفيسبوك الرسمية",
      username: "CreatorPage",
      url: "https://facebook.com",
      icon: "fa-brands fa-facebook",
      color: "#1877F2",
      gradient: "linear-gradient(135deg, #1877F2, #0d53ad)",
      description: "أحدث الأخبار، البثوث المباشرة والمنشورات الحصرية.",
      subscribers: "50K+",
      clicks: 0,
      active: true
    },
    {
      id: "discord",
      name: "Discord",
      title: "مجتمع وسيرفر الديسكورد",
      username: "Horizon Services",
      url: "https://discord.gg/swj6DHy2a",
      icon: "fa-brands fa-discord",
      color: "#5865F2",
      gradient: "linear-gradient(135deg, #5865F2, #3c45a5)",
      description: "انضم لسيرفرنا للدردشة، اللعب معاً والمشاركة في الفعاليات!",
      subscribers: "15K+",
      clicks: 0,
      active: true
    }
  ],
  customLinks: [],
  botSettings: {
    announcementChannelId: "",
    defaultColor: "#5865F2",
    customEmbedTitle: "📢 إشعار جديد من صانع المحتوى!",
    footerText: "Social Hub • جميع الحقوق محفوظة"
  },
  announcements: [],
  analytics: {
    totalPageViews: 0,
    lastVisit: null
  }
};

class Database {
  constructor() {
    this.ensureDataDirectory();
    this.load();
  }

  ensureDataDirectory() {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        // Merge missing defaults if database structure upgraded
        this.data = { ...DEFAULT_DATA, ...this.data };
      } else {
        this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
        this.save();
      }
    } catch (err) {
      console.error('Error reading database file, using fallback defaults:', err.message);
      this.data = JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err.message);
    }
  }

  getProfile() {
    return this.data.profile;
  }

  updateProfile(newProfile) {
    this.data.profile = { ...this.data.profile, ...newProfile };
    this.save();
    return this.data.profile;
  }

  getSocials(includeInactive = false) {
    if (includeInactive) return this.data.socials;
    return this.data.socials.filter(s => s.active !== false);
  }

  getSocialById(id) {
    return this.data.socials.find(s => s.id === id);
  }

  updateSocial(id, updatedFields) {
    const idx = this.data.socials.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.socials[idx] = { ...this.data.socials[idx], ...updatedFields };
      this.save();
      return this.data.socials[idx];
    }
    return null;
  }

  updateAllSocials(socialsList) {
    if (Array.isArray(socialsList)) {
      this.data.socials = socialsList;
      this.save();
      return this.data.socials;
    }
    return null;
  }

  recordClick(platformId) {
    const social = this.data.socials.find(s => s.id === platformId);
    if (social) {
      social.clicks = (social.clicks || 0) + 1;
      this.save();
      return social.clicks;
    }
    return 0;
  }

  recordPageView() {
    this.data.analytics.totalPageViews = (this.data.analytics.totalPageViews || 0) + 1;
    this.data.analytics.lastVisit = new Date().toISOString();
    this.save();
    return this.data.analytics.totalPageViews;
  }

  getBotSettings() {
    return this.data.botSettings;
  }

  updateBotSettings(newSettings) {
    this.data.botSettings = { ...this.data.botSettings, ...newSettings };
    this.save();
    return this.data.botSettings;
  }

  addAnnouncement(announcement) {
    const record = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...announcement
    };
    this.data.announcements.unshift(record);
    if (this.data.announcements.length > 50) {
      this.data.announcements.pop();
    }
    this.save();
    return record;
  }

  getAnnouncements() {
    return this.data.announcements || [];
  }

  deleteAnnouncement(id) {
    const item = (this.data.announcements || []).find(a => a.id === id);
    this.data.announcements = (this.data.announcements || []).filter(a => a.id !== id);
    this.save();
    return item;
  }

  getAnalytics() {
    const platformClicks = {};
    this.data.socials.forEach(s => {
      platformClicks[s.id] = {
        name: s.name,
        clicks: s.clicks || 0,
        color: s.color
      };
    });
    return {
      totalPageViews: this.data.analytics.totalPageViews || 0,
      lastVisit: this.data.analytics.lastVisit,
      platformClicks
    };
  }
}

const db = new Database();
module.exports = db;
