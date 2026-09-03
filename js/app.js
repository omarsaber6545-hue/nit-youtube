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
    discordServer: "https://discord.gg/swj6DHy2a"
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
      featuredVideoId: "dQw4w9WgXcQ"
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
      subscribers: "Horizon Community"
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
      title: "مجتمع وسيرفر الديسكورد",
      username: "Horizon Services",
      url: "https://discord.gg/swj6DHy2a",
      icon: "fa-brands fa-discord",
      color: "#5865F2",
      gradient: "linear-gradient(135deg, #5865F2, #3c45a5)",
      description: "انضم لسيرفرنا للدردشة، الألعاب، طلب الخدمات والمشاركة في الفعاليات!",
      subscribers: "+15K"
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

  const publishSuccessModal = document.getElementById("publishSuccessModal");
  const successModalTitle = document.getElementById("successModalTitle");
  const closeSuccessModalBtn = document.getElementById("closeSuccessModalBtn");

  if (closeSuccessModalBtn && publishSuccessModal) {
    closeSuccessModalBtn.addEventListener("click", () => {
      publishSuccessModal.classList.remove("open");
      publishSuccessModal.style.setProperty("display", "none", "important");
    });
  }

  if (publishSuccessModal) {
    publishSuccessModal.addEventListener("click", (e) => {
      if (e.target === publishSuccessModal) {
        publishSuccessModal.classList.remove("open");
        publishSuccessModal.style.setProperty("display", "none", "important");
      }
    });
  }

  const publishAlertBox = document.getElementById("publishAlertBox");

  const announcerForm = document.getElementById("announcerForm");
  const announcePlatform = document.getElementById("announcePlatform");
  const announceTitle = document.getElementById("announceTitle");
  const announceLink = document.getElementById("announceLink");
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
    if (adminAuthModal) {
      adminAuthModal.classList.add("open");
      adminAuthModal.style.setProperty("display", "flex", "important");
    }
    if (adminPinInput) adminPinInput.focus();
  }

  function openPublishModal() {
    if (adminAuthModal) {
      adminAuthModal.classList.remove("open");
      adminAuthModal.style.setProperty("display", "none", "important");
    }
    if (adminPublishModal) {
      adminPublishModal.classList.add("open");
      adminPublishModal.style.setProperty("display", "flex", "important");
    }

    if (publishAlertBox) publishAlertBox.style.display = "none";
    renderAnnouncementsHistory();
  }

  // Close modals
  if (closeAuthModal && adminAuthModal) {
    closeAuthModal.addEventListener("click", () => {
      adminAuthModal.classList.remove("open");
      adminAuthModal.style.setProperty("display", "none", "important");
    });
  }

  if (closePublishModal && adminPublishModal) {
    closePublishModal.addEventListener("click", () => {
      adminPublishModal.classList.remove("open");
      adminPublishModal.style.setProperty("display", "none", "important");
    });
  }

  [adminAuthModal, adminPublishModal].forEach((modal) => {
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("open");
          modal.style.setProperty("display", "none", "important");
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

  // Handle Announcement Submit (Direct Bot Dispatch like nit youtube)
  if (announcerForm) {
    announcerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (publishAlertBox) publishAlertBox.style.display = "none";

      const platform = announcePlatform ? announcePlatform.value : "youtube";
      const title = announceTitle ? announceTitle.value.trim() : "";
      const rawLink = announceLink ? announceLink.value.trim() : "";
      const message = announceMessage ? announceMessage.value.trim() : "";

      // Validation 1: Title
      if (!title) {
        if (publishAlertBox) {
          publishAlertBox.className = "publish-alert-box error";
          publishAlertBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>⚠️ يرجى كتابة عنوان للإشعار قبل النشر!</span>';
        }
        if (announceTitle) announceTitle.focus();
        return;
      }

      // Validation 2: Link
      if (!rawLink) {
        if (publishAlertBox) {
          publishAlertBox.className = "publish-alert-box error";
          publishAlertBox.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i> <span>⚠️ يرجى وضع رابط الفيديو أو المنشور!</span>';
        }
        if (announceLink) announceLink.focus();
        return;
      }

      // Normalize Link
      let cleanLink = rawLink;
      if (!cleanLink.startsWith("http://") && !cleanLink.startsWith("https://")) {
        cleanLink = "https://" + cleanLink;
      }

      sendAnnouncementBtn.disabled = true;
      sendAnnouncementBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري النشر عبر بوت الديسكورد...</span>';

      try {
        const payload = {
          platform,
          title,
          link: cleanLink,
          message
        };

        const res = await fetch('/api/admin/announce', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': '1234'
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();

        if (res.ok && data.success) {
          // 1. Show Big Celebratory Success Modal
          if (successModalTitle) successModalTitle.textContent = title;
          if (publishSuccessModal) {
            publishSuccessModal.classList.add("open");
            publishSuccessModal.style.setProperty("display", "flex", "important");
          }

          // 2. Top-of-form Success Banner
          if (publishAlertBox) {
            publishAlertBox.className = "publish-alert-box success";
            publishAlertBox.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>${data.message || 'تم إرسال الإشعار إلى سيرفر الديسكورد بنجاح! 🚀'}</span>`;
            publishAlertBox.scrollIntoView({ behavior: "smooth", block: "center" });
          }

          // 3. Floating Toast
          showToast("🎉 تم نشر الإشعار في سيرفر الديسكورد بنجاح!");
          
          if (announceTitle) announceTitle.value = "";
          if (announceLink) announceLink.value = "";
          if (announceMessage) announceMessage.value = "";

          saveAnnouncementToHistory({
            id: Date.now().toString(),
            platform,
            title,
            link: cleanLink,
            message,
            timestamp: new Date().toISOString()
          });

          renderAnnouncementsHistory();
        } else {
          throw new Error(data.error || 'فشل إرسال الإشعار للديسكورد');
        }
      } catch (err) {
        console.error("Announcement error:", err);
        if (publishAlertBox) {
          publishAlertBox.className = "publish-alert-box error";
          publishAlertBox.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <span>❌ ${err.message || 'تعذر الاتصال بالبوت أو الخادم'}</span>`;
          publishAlertBox.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        showToast("❌ تعذر إرسال الإشعار");
      } finally {
        sendAnnouncementBtn.disabled = false;
        sendAnnouncementBtn.innerHTML = '<i class="fa-brands fa-discord"></i> <span>🚀 إرسال ونشر الإشعار في سيرفر الديسكورد الآن</span>';
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
