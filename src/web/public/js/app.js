document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const profileBanner = document.getElementById('profileBanner');
  const profileAvatar = document.getElementById('profileAvatar');
  const creatorName = document.getElementById('creatorName');
  const creatorHandle = document.getElementById('creatorHandle');
  const creatorBio = document.getElementById('creatorBio');
  const creatorLocation = document.getElementById('creatorLocation');
  const creatorEmail = document.getElementById('creatorEmail');
  const socialCardsGrid = document.getElementById('socialCardsGrid');
  const botStatusBadge = document.getElementById('botStatusBadge');
  const botStatusText = document.getElementById('botStatusText');
  const featuredVideoSection = document.getElementById('featuredVideoSection');
  const ytVideoIframe = document.getElementById('ytVideoIframe');
  const joinDiscordBtn = document.getElementById('joinDiscordBtn');
  const currentYearSpan = document.getElementById('currentYear');

  // Share Modal Elements
  const sharePageBtn = document.getElementById('sharePageBtn');
  const shareModal = document.getElementById('shareModal');
  const closeShareModal = document.getElementById('closeShareModal');
  const shareUrlInput = document.getElementById('shareUrlInput');
  const copyUrlBtn = document.getElementById('copyUrlBtn');
  const qrCodeImg = document.getElementById('qrCodeImg');

  // Set Year
  if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
  }

  // Record page view analytics
  fetch('/api/analytics/view', { method: 'POST' }).catch(() => {});

  // Fetch initial profile & socials data
  async function loadData() {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) throw new Error('فشل جلب البيانات من الخادم');
      const data = await res.json();

      renderProfile(data.profile);
      renderSocials(data.socials);
      renderBotStatus(data.bot);
    } catch (err) {
      console.error('Error loading profile:', err);
      socialCardsGrid.innerHTML = `
        <div class="loading-state">
          <p style="color: #ef4444;">❌ تعذر تحميل البيانات. تأكد من تشغيل السيرفر بشكل صحيح.</p>
        </div>
      `;
    }
  }

  function renderProfile(profile) {
    if (!profile) return;

    document.title = `${profile.name} | Social Media Hub`;
    creatorName.textContent = profile.name;
    creatorHandle.textContent = profile.handle;
    creatorBio.textContent = profile.bio;

    if (profile.avatar) profileAvatar.src = profile.avatar;
    if (profile.banner) profileBanner.src = profile.banner;

    if (creatorLocation) creatorLocation.textContent = profile.location || 'مصر / العالم العربي';
    if (creatorEmail) creatorEmail.textContent = profile.email || 'contact@creator.com';
  }

  function renderSocials(socials) {
    if (!Array.isArray(socials) || socials.length === 0) {
      socialCardsGrid.innerHTML = '<p class="loading-state">لا توجد روابط مضافة حتى الآن.</p>';
      return;
    }

    socialCardsGrid.innerHTML = '';

    socials.forEach(social => {
      // Check if YouTube has a featured video
      if (social.id === 'youtube' && social.featuredVideoId) {
        ytVideoIframe.src = `https://www.youtube.com/embed/${social.featuredVideoId}`;
        featuredVideoSection.style.display = 'block';
      }

      // Update Discord Join button if present
      if (social.id === 'discord' && joinDiscordBtn) {
        joinDiscordBtn.href = social.url;
      }

      const card = document.createElement('a');
      card.className = 'social-card';
      card.href = social.url;
      card.target = '_blank';
      card.rel = 'noopener noreferrer';
      
      // Set CSS Custom properties for dynamic brand gradients and glows
      card.style.setProperty('--card-accent', social.color || '#6366F1');
      if (social.gradient) {
        card.style.setProperty('--card-gradient', social.gradient);
      }
      card.style.setProperty('--card-glow', `0 0 20px ${social.color}33`);

      card.innerHTML = `
        <div class="social-card-left">
          <div class="social-icon-wrapper">
            <i class="${social.icon || 'fa-solid fa-link'}"></i>
          </div>
          <div class="social-details">
            <h3>
              ${social.title || social.name}
              <span class="social-handle">${social.username || ''}</span>
            </h3>
            <p class="social-desc">${social.description || ''}</p>
          </div>
        </div>
        <div class="social-card-right">
          ${social.subscribers ? `<span class="social-badge"><i class="fa-solid fa-users"></i> ${social.subscribers}</span>` : ''}
          <div class="action-arrow">
            <i class="fa-solid fa-arrow-left"></i>
          </div>
        </div>
      `;

      // Intercept click to track analytics asynchronously
      card.addEventListener('click', () => {
        fetch(`/api/click/${social.id}`, { method: 'POST' }).catch(() => {});
      });

      socialCardsGrid.appendChild(card);
    });
  }

  function renderBotStatus(bot) {
    if (!botStatusBadge || !botStatusText) return;
    const pulseDot = botStatusBadge.querySelector('.pulse-dot');

    if (bot && bot.online) {
      botStatusText.textContent = `البوت متصل (${bot.guildsCount || 1} سيرفر)`;
      pulseDot.classList.remove('offline');
    } else {
      botStatusText.textContent = 'البوت في وضع الاستعداد';
      pulseDot.classList.add('offline');
    }
  }

  // Share & QR Code Logic
  const currentUrl = window.location.href;
  if (shareUrlInput) shareUrlInput.value = currentUrl;
  if (qrCodeImg) {
    qrCodeImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;
  }

  if (sharePageBtn && shareModal) {
    sharePageBtn.addEventListener('click', () => {
      shareModal.style.display = 'flex';
    });
  }

  if (closeShareModal && shareModal) {
    closeShareModal.addEventListener('click', () => {
      shareModal.style.display = 'none';
    });

    shareModal.addEventListener('click', (e) => {
      if (e.target === shareModal) {
        shareModal.style.display = 'none';
      }
    });
  }

  if (copyUrlBtn && shareUrlInput) {
    copyUrlBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareUrlInput.value);
        showToast('تم نسخ الرابط إلى الحافظة بنجاح! 📋', 'success');
      } catch (err) {
        shareUrlInput.select();
        document.execCommand('copy');
        showToast('تم نسخ الرابط! 📋', 'success');
      }
    });
  }

  // Toast Function
  window.showToast = function(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? 'fa-check' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 3000);
  };

  // Initial Load
  loadData();
});
