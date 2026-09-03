/**
 * Horizon Services - Standalone Social Hub & Web Portal
 * Optimized for Vercel Static Hosting with zero dependencies
 */

const DEFAULT_DATA = {
  profile: {
    name: "عمر الشامي - Omar Creator",
    handle: "@omar_official • Horizon Services",
    bio: "صانع محتوى ومطور أنظمة برمجية في Horizon Services. نقدم حلول الديسكورد، الويب واستضافات VPS السحابية 🚀",
    avatar: "assets/avatar.png",
    banner: "assets/avatar.png",
    verified: true,
    location: "مصر / العالم العربي",
    email: "contact@horizonservices.com",
    discordServer: "https://discord.gg/hz-s"
  },
  socials: [
    {
      id: "youtube",
      name: "YouTube",
      title: "قناة اليوتيوب الرسمية",
      username: "@CreatorYT",
      url: "https://youtube.com",
      icon: "fa-brands fa-youtube",
      color: "#FF0000",
      gradient: "linear-gradient(135deg, #FF0000, #b30000)",
      description: "فيديوهات وشروحات وتحديات تقنية جديدة أسبوعياً!",
      subscribers: "500K+",
      featuredVideoId: "dQw4w9WgXcQ"
    },
    {
      id: "tiktok",
      name: "TikTok",
      title: "حساب التيك توك",
      username: "@CreatorTikTok",
      url: "https://tiktok.com",
      icon: "fa-brands fa-tiktok",
      color: "#00F2FE",
      gradient: "linear-gradient(135deg, #00F2FE, #FE0979)",
      description: "مقاطع قصيرة، كواليس ويوميات ممتعة كل يوم!",
      subscribers: "250K+"
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
      subscribers: "80K+"
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
      subscribers: "50K+"
    },
    {
      id: "discord",
      name: "Discord",
      title: "مجتمع وسيرفر Horizon Services",
      username: "Horizon Community",
      url: "https://discord.gg/hz-s",
      icon: "fa-brands fa-discord",
      color: "#5865F2",
      gradient: "linear-gradient(135deg, #5865F2, #3c45a5)",
      description: "انضم لسيرفرنا للدردشة، الألعاب، طلب الخدمات والمشاركة في الفعاليات!",
      subscribers: "15K+"
    }
  ]
};

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const profileBanner = document.getElementById("profileBanner");
  const profileAvatar = document.getElementById("profileAvatar");
  const creatorName = document.getElementById("creatorName");
  const creatorHandle = document.getElementById("creatorHandle");
  const creatorBio = document.getElementById("creatorBio");
  const creatorLocation = document.getElementById("creatorLocation");
  const creatorEmail = document.getElementById("creatorEmail");
  const socialCardsGrid = document.getElementById("socialCardsGrid");
  const featuredVideoSection = document.getElementById("featuredVideoSection");
  const ytVideoIframe = document.getElementById("ytVideoIframe");
  const joinDiscordBtn = document.getElementById("joinDiscordBtn");
  const currentYearSpan = document.getElementById("currentYear");

  // Share Modal Elements
  const sharePageBtn = document.getElementById("sharePageBtn");
  const shareModal = document.getElementById("shareModal");
  const closeShareModal = document.getElementById("closeShareModal");
  const shareUrlInput = document.getElementById("shareUrlInput");
  const copyUrlBtn = document.getElementById("copyUrlBtn");
  const qrCodeImg = document.getElementById("qrCodeImg");
  const toastContainer = document.getElementById("toastContainer");

  // Set Year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Load Data with Fallback
  async function loadData() {
    try {
      const res = await fetch("data/socials.json");
      if (!res.ok) throw new Error("Could not fetch data/socials.json");
      const data = await res.json();
      renderProfile(data.profile || DEFAULT_DATA.profile);
      renderSocials(data.socials || DEFAULT_DATA.socials);
    } catch (err) {
      // Graceful fallback to default data
      renderProfile(DEFAULT_DATA.profile);
      renderSocials(DEFAULT_DATA.socials);
    }
  }

  function renderProfile(profile) {
    if (!profile) return;
    document.title = `${profile.name} | Horizon Services`;
    if (creatorName) creatorName.textContent = profile.name;
    if (creatorHandle) creatorHandle.textContent = profile.handle;
    if (creatorBio) creatorBio.textContent = profile.bio;
    if (profile.avatar && profileAvatar) profileAvatar.src = profile.avatar;
    if (profile.banner && profileBanner) profileBanner.src = profile.banner;
    if (creatorLocation) creatorLocation.textContent = profile.location || "مصر / العالم العربي";
    if (creatorEmail) creatorEmail.textContent = profile.email || "contact@horizonservices.com";
  }

  function renderSocials(socials) {
    if (!socialCardsGrid) return;
    socialCardsGrid.innerHTML = "";

    socials.forEach((social) => {
      // Check for featured YouTube video
      if (social.id === "youtube" && social.featuredVideoId && ytVideoIframe && featuredVideoSection) {
        ytVideoIframe.src = `https://www.youtube.com/embed/${social.featuredVideoId}`;
        featuredVideoSection.style.display = "block";
      }

      // Update Discord link if present
      if (social.id === "discord" && joinDiscordBtn) {
        joinDiscordBtn.href = social.url;
      }

      const card = document.createElement("a");
      card.className = "social-card";
      card.href = social.url;
      card.target = "_blank";
      card.rel = "noopener noreferrer";

      // CSS Custom Properties for Brand Theming
      card.style.setProperty("--card-accent", social.color || "#E50914");
      if (social.gradient) {
        card.style.setProperty("--card-gradient", social.gradient);
      }
      card.style.setProperty("--card-glow", `0 0 24px ${social.color}44`);

      // Track clicks locally
      card.addEventListener("click", () => {
        const key = `clicks_${social.id}`;
        const current = parseInt(localStorage.getItem(key) || "0", 10);
        localStorage.setItem(key, (current + 1).toString());
      });

      card.innerHTML = `
        <div class="social-card-left">
          <div class="social-icon-wrapper">
            <i class="${social.icon || 'fa-solid fa-link'}"></i>
          </div>
          <div class="social-card-info">
            <h3>${social.title || social.name}</h3>
            <div class="social-meta-row">
              <span class="social-username">${social.username || ''}</span>
              ${social.subscribers ? `<span class="social-badge">${social.subscribers}</span>` : ''}
            </div>
            <p class="social-desc">${social.description || ''}</p>
          </div>
        </div>
        <div class="social-card-right">
          <span>انتقال</span>
          <i class="fa-solid fa-arrow-left"></i>
        </div>
      `;

      socialCardsGrid.appendChild(card);
    });
  }

  // Toast Function
  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Share Modal Logic
  const currentUrl = window.location.href.split("#")[0];
  if (shareUrlInput) shareUrlInput.value = currentUrl;
  if (qrCodeImg) {
    qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;
  }

  if (sharePageBtn && shareModal) {
    sharePageBtn.addEventListener("click", () => {
      shareModal.style.display = "flex";
    });
  }

  if (closeShareModal && shareModal) {
    closeShareModal.addEventListener("click", () => {
      shareModal.style.display = "none";
    });
  }

  if (shareModal) {
    shareModal.addEventListener("click", (e) => {
      if (e.target === shareModal) {
        shareModal.style.display = "none";
      }
    });
  }

  if (copyUrlBtn && shareUrlInput) {
    copyUrlBtn.addEventListener("click", () => {
      shareUrlInput.select();
      shareUrlInput.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(shareUrlInput.value).then(() => {
        showToast("✅ تم نسخ الرابط إلى الحافظة بنجاح!");
      }).catch(() => {
        document.execCommand("copy");
        showToast("✅ تم نسخ الرابط!");
      });
    });
  }

  // ==========================================
  // ADMIN AUTH & PUBLISHING ANNOUNCER (PIN: 1234)
  // ==========================================
  const openAdminBtn = document.getElementById("openAdminBtn");
  const adminAuthModal = document.getElementById("adminAuthModal");
  const closeAuthModal = document.getElementById("closeAuthModal");
  const adminAuthForm = document.getElementById("adminAuthForm");
  const adminPinInput = document.getElementById("adminPinInput");
  const authErrorMsg = document.getElementById("authErrorMsg");

  const adminPublishModal = document.getElementById("adminPublishModal");
  const closePublishModal = document.getElementById("closePublishModal");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");

  const discordWebhookInput = document.getElementById("discordWebhookInput");
  const webhookSavedBadge = document.getElementById("webhookSavedBadge");
  const announcerForm = document.getElementById("announcerForm");
  const announcePlatform = document.getElementById("announcePlatform");
  const announceTitle = document.getElementById("announceTitle");
  const announceLink = document.getElementById("announceLink");
  const announcePing = document.getElementById("announcePing");
  const announceMessage = document.getElementById("announceMessage");
  const sendAnnouncementBtn = document.getElementById("sendAnnouncementBtn");
  const announcementsHistoryList = document.getElementById("announcementsHistoryList");

  // Check if admin is authenticated
  function isAdminLoggedIn() {
    return (
      sessionStorage.getItem("admin_authenticated") === "1234" ||
      localStorage.getItem("admin_authenticated") === "1234"
    );
  }

  // Open Admin Flow
  if (openAdminBtn) {
    openAdminBtn.addEventListener("click", () => {
      if (isAdminLoggedIn()) {
        openPublishModal();
      } else {
        openAuthModal();
      }
    });
  }

  function openAuthModal() {
    if (adminPinInput) adminPinInput.value = "";
    if (authErrorMsg) authErrorMsg.style.display = "none";
    if (adminAuthModal) adminAuthModal.style.display = "flex";
    if (adminPinInput) adminPinInput.focus();
  }

  function openPublishModal() {
    if (adminAuthModal) adminAuthModal.style.display = "none";
    if (adminPublishModal) adminPublishModal.style.display = "flex";

    // Load saved webhook
    const savedWebhook = localStorage.getItem("discord_webhook_url") || "";
    if (discordWebhookInput) {
      discordWebhookInput.value = savedWebhook;
      if (savedWebhook && webhookSavedBadge) {
        webhookSavedBadge.style.display = "inline";
      }
    }

    renderAnnouncementsHistory();
  }

  // Close modals
  if (closeAuthModal && adminAuthModal) {
    closeAuthModal.addEventListener("click", () => {
      adminAuthModal.style.display = "none";
    });
  }

  if (closePublishModal && adminPublishModal) {
    closePublishModal.addEventListener("click", () => {
      adminPublishModal.style.display = "none";
    });
  }

  [adminAuthModal, adminPublishModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.style.display = "none";
        }
      });
    }
  });

  // Admin Auth Submit (Password: 1234)
  if (adminAuthForm) {
    adminAuthForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const pin = adminPinInput.value.trim();

      if (pin === "1234") {
        sessionStorage.setItem("admin_authenticated", "1234");
        localStorage.setItem("admin_authenticated", "1234");
        showToast("✅ تم تأكيد كلمة المرور بنجاح (1234)!");
        openPublishModal();
      } else {
        if (authErrorMsg) {
          authErrorMsg.textContent = "❌ رمز المرور غير صحيح! (الرمز هو 1234)";
          authErrorMsg.style.display = "block";
        }
      }
    });
  }

  // Admin Logout
  if (adminLogoutBtn) {
    adminLogoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("admin_authenticated");
      localStorage.removeItem("admin_authenticated");
      if (adminPublishModal) adminPublishModal.style.display = "none";
      showToast("تم تسجيل الخروج بنجاح.");
    });
  }

  // Save Webhook on input change
  if (discordWebhookInput) {
    discordWebhookInput.addEventListener("input", () => {
      const val = discordWebhookInput.value.trim();
      localStorage.setItem("discord_webhook_url", val);
      if (webhookSavedBadge) {
        webhookSavedBadge.style.display = val ? "inline" : "none";
      }
    });
  }

  // Helper to extract YouTube video thumbnail
  function getYouTubeThumbnail(url) {
    if (!url) return null;
    const match = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
  }

  // Handle Announcement Submit
  if (announcerForm) {
    announcerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const platform = announcePlatform.value;
      const title = announceTitle.value.trim();
      const link = announceLink.value.trim();
      const ping = announcePing.value;
      const message = announceMessage.value.trim();
      const webhookUrl = (discordWebhookInput ? discordWebhookInput.value.trim() : "") ||
                         localStorage.getItem("discord_webhook_url");

      sendAnnouncementBtn.disabled = true;
      sendAnnouncementBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري النشر عبر بوت الديسكورد...</span>';

      let publishedSuccessfully = false;

      // 1. Try sending via serverless API /api/announce (Bot Token: MTU0MzY3...)
      try {
        const apiRes = await fetch("/api/announce", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "1234"
          },
          body: JSON.stringify({
            pin: "1234",
            platform,
            title,
            link,
            ping,
            message
          })
        });

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          if (apiData.success) {
            publishedSuccessfully = true;
          }
        }
      } catch (apiErr) {
        // Fallback to Webhook if API is unavailable (e.g. running on static file://)
        console.log("Direct /api/announce not reachable, checking webhook fallback...", apiErr);
      }

      // 2. If not published via API, fallback to Webhook if configured
      if (!publishedSuccessfully) {
        if (webhookUrl && webhookUrl.startsWith("https://discord.com/api/webhooks/")) {
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
            author: { name: `Horizon Services • ${meta.name}`, icon_url: meta.icon },
            description: `${message ? `>>> 💬 **رسالة الإدارة:**\n${message}\n\n` : ""}🔗 **الرابط:** [انقر هنا للمشاهدة والتفاعل مباشرة](${link})`,
            footer: { text: "Horizon Services • نظام النشر الآلي المعتمد", icon_url: meta.icon },
            timestamp: new Date().toISOString()
          };

          if (platform === "youtube") {
            const ytThumb = getYouTubeThumbnail(link);
            if (ytThumb) embed.image = { url: ytThumb };
          }

          try {
            const hookRes = await fetch(webhookUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                username: "Horizon Services • Announcer",
                avatar_url: meta.icon,
                content: content || undefined,
                embeds: [embed]
              })
            });
            if (hookRes.ok) {
              publishedSuccessfully = true;
            }
          } catch (hookErr) {
            console.error("Webhook fallback error:", hookErr);
          }
        }
      }

      sendAnnouncementBtn.disabled = false;
      sendAnnouncementBtn.innerHTML = '<i class="fa-brands fa-discord"></i> <span>🚀 إرسال ونشر الإشعار في سيرفر الديسكورد الآن</span>';

      if (publishedSuccessfully) {
        saveAnnouncementToHistory({
          id: Date.now().toString(),
          platform,
          title,
          link,
          message,
          timestamp: new Date().toISOString()
        });

        showToast("🚀 تم نشر الإشعار في سيرفر الديسكورد بنجاح!");
        announceTitle.value = "";
        announceLink.value = "";
        announceMessage.value = "";
        renderAnnouncementsHistory();
      } else {
        alert("⚠️ تعذر النشر تلقائياً:\nإذا كنت تفتح الصفحة كملف محلي (file://)، يرجى إدخال رابط Webhook من روم الديسكورد في الحقل المخصص أعلاه.\nأما عند رفع الموقع على Vercel أو الخادم سيعمل النشر تلقائياً عبر البوت!");
      }
    });
  }

  function getAnnouncementsHistory() {
    try {
      return JSON.parse(localStorage.getItem("announcements_history") || "[]");
    } catch {
      return [];
    }
  }

  function saveAnnouncementToHistory(item) {
    const list = getAnnouncementsHistory();
    list.unshift(item);
    localStorage.setItem("announcements_history", JSON.stringify(list.slice(0, 20)));
  }

  function renderAnnouncementsHistory() {
    if (!announcementsHistoryList) return;
    const history = getAnnouncementsHistory();

    if (history.length === 0) {
      announcementsHistoryList.innerHTML = '<p class="empty-history">لا توجد إشعارات سابقة مسجلة.</p>';
      return;
    }

    announcementsHistoryList.innerHTML = "";
    history.forEach((item) => {
      const el = document.createElement("div");
      el.className = "history-item";
      el.innerHTML = `
        <div class="history-item-left">
          <span class="history-item-title">${item.title}</span>
          <span class="history-item-meta">المنصة: <strong>${item.platform.toUpperCase()}</strong> • ${new Date(item.timestamp).toLocaleString("ar-EG")}</span>
        </div>
        <div class="history-item-actions">
          <a href="${item.link}" target="_blank" rel="noopener noreferrer" class="history-action-btn" title="فتح الرابط">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <button type="button" class="history-action-btn history-delete-btn" data-id="${item.id}" title="حذف من السجل">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;

      el.querySelector(".history-delete-btn").addEventListener("click", () => {
        const remaining = getAnnouncementsHistory().filter((h) => h.id !== item.id);
        localStorage.setItem("announcements_history", JSON.stringify(remaining));
        renderAnnouncementsHistory();
      });

      announcementsHistoryList.appendChild(el);
    });
  }

  // Initialize
  loadData();
});
