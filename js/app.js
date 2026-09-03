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

  // Initialize
  loadData();
});
