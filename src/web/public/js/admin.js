document.addEventListener('DOMContentLoaded', () => {
  // Authentication State
  let adminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken');
  let currentAdminData = null;

  // DOM Elements
  const loginOverlay = document.getElementById('loginOverlay');
  const loginForm = document.getElementById('loginForm');
  const pinInput = document.getElementById('pinInput');
  const loginError = document.getElementById('loginError');
  const adminApp = document.getElementById('adminApp');
  const logoutBtn = document.getElementById('logoutBtn');

  // Tabs
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  // Profile Form
  const profileForm = document.getElementById('profileForm');
  const nameInput = document.getElementById('nameInput');
  const handleInput = document.getElementById('handleInput');
  const bioInput = document.getElementById('bioInput');
  const avatarInput = document.getElementById('avatarInput');
  const bannerInput = document.getElementById('bannerInput');
  const locationInput = document.getElementById('locationInput');
  const emailInput = document.getElementById('emailInput');

  // Socials Container
  const socialsContainer = document.getElementById('socialsContainer');
  const ytVideoIdInput = document.getElementById('ytVideoIdInput');
  const saveYtVideoBtn = document.getElementById('saveYtVideoBtn');

  // Announcer Form
  const announcerForm = document.getElementById('announcerForm');
  const announcePlatform = document.getElementById('announcePlatform');
  const announceTitle = document.getElementById('announceTitle');
  const announceLink = document.getElementById('announceLink');
  const announceMessage = document.getElementById('announceMessage');
  const announcementsHistoryList = document.getElementById('announcementsHistoryList');

  // Analytics
  const totalViewsVal = document.getElementById('totalViewsVal');
  const totalClicksVal = document.getElementById('totalClicksVal');
  const platformClicksBreakdown = document.getElementById('platformClicksBreakdown');

  // Bot Settings
  const botHeroStatus = document.getElementById('botHeroStatus');
  const adminBotBeacon = document.getElementById('adminBotBeacon');
  const adminBotTitle = document.getElementById('adminBotTitle');
  const adminBotDetail = document.getElementById('adminBotDetail');
  const refreshBotStatusBtn = document.getElementById('refreshBotStatusBtn');
  const botSettingsForm = document.getElementById('botSettingsForm');
  const announceChannelId = document.getElementById('announceChannelId');
  const embedTitleInput = document.getElementById('embedTitleInput');
  const footerTextInput = document.getElementById('footerTextInput');

  // Check auth on load
  if (adminToken) {
    verifyAndLoadData();
  } else {
    showLogin();
  }

  function showLogin() {
    loginOverlay.style.display = 'flex';
    adminApp.style.display = 'none';
  }

  function showApp() {
    loginOverlay.style.display = 'none';
    adminApp.style.display = 'flex';
  }

  // Handle Login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const pin = pinInput.value.trim();
    loginError.style.display = 'none';

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        adminToken = pin;
        sessionStorage.setItem('adminToken', pin);
        showApp();
        loadAdminData();
        showToast('تم تسجيل الدخول بنجاح!', 'success');
      } else {
        loginError.textContent = data.error || 'رمز المرور غير صحيح';
        loginError.style.display = 'block';
      }
    } catch (err) {
      loginError.textContent = 'حدث خطأ في الاتصال بالخادم';
      loginError.style.display = 'block';
    }
  });

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('adminToken');
      localStorage.removeItem('adminToken');
      adminToken = null;
      showLogin();
      showToast('تم تسجيل الخروج', 'info');
    });
  }

  // Tab Switching
  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      navTabs.forEach(t => t.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(target);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // Load Admin Data
  async function verifyAndLoadData() {
    try {
      const res = await fetch('/api/admin/data', {
        headers: { 'Authorization': adminToken }
      });

      if (res.status === 401 || res.status === 403) {
        showLogin();
        return;
      }

      showApp();
      await loadAdminData();
    } catch (err) {
      showLogin();
    }
  }

  async function loadAdminData() {
    try {
      const res = await fetch('/api/admin/data', {
        headers: { 'Authorization': adminToken }
      });
      if (!res.ok) throw new Error('فشل جلب البيانات');
      const data = await res.json();
      currentAdminData = data;

      populateProfile(data.profile);
      populateSocials(data.socials);
      populateAnnouncementsHistory(data.announcements);
      populateAnalytics(data.analytics);
      populateBotSettings(data.botSettings, data.botStatus);
    } catch (err) {
      console.error('Error loading admin data:', err);
      showToast('حدث خطأ أثناء تحميل بيانات الإدارة', 'info');
    }
  }

  // Populate Profile Form
  function populateProfile(profile) {
    if (!profile) return;
    nameInput.value = profile.name || '';
    handleInput.value = profile.handle || '';
    bioInput.value = profile.bio || '';
    avatarInput.value = profile.avatar || '';
    bannerInput.value = profile.banner || '';
    locationInput.value = profile.location || '';
    emailInput.value = profile.email || '';
  }

  // Save Profile Form
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: nameInput.value.trim(),
        handle: handleInput.value.trim(),
        bio: bioInput.value.trim(),
        avatar: avatarInput.value.trim(),
        banner: bannerInput.value.trim(),
        location: locationInput.value.trim(),
        email: emailInput.value.trim()
      };

      const res = await fetch('/api/admin/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': adminToken
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('تم حفظ بيانات الملف الشخصي بنجاح! ✨', 'success');
      } else {
        throw new Error('فشل الحفظ');
      }
    } catch (err) {
      showToast('حدث خطأ أثناء حفظ الملف الشخصي', 'info');
    }
  });

  // Populate Socials
  function populateSocials(socials) {
    if (!Array.isArray(socials)) return;
    socialsContainer.innerHTML = '';

    socials.forEach(s => {
      if (s.id === 'youtube' && s.featuredVideoId) {
        ytVideoIdInput.value = s.featuredVideoId;
      }

      const card = document.createElement('div');
      card.className = 'social-edit-card';
      card.innerHTML = `
        <div class="social-edit-header">
          <div class="social-title-brand">
            <i class="${s.icon}" style="color: ${s.color}; font-size: 1.4rem;"></i>
            <span>${s.name} (${s.title})</span>
          </div>
          <div class="toggle-wrap">
            <span>تفعيل في الموقع:</span>
            <label class="toggle-switch">
              <input type="checkbox" class="social-toggle" data-id="${s.id}" ${s.active !== false ? 'checked' : ''}>
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>رابط الحساب (URL)</label>
            <input type="url" class="social-url" data-id="${s.id}" value="${s.url || ''}" dir="ltr">
          </div>
          <div class="form-group">
            <label>اسم المستخدم / المعرف</label>
            <input type="text" class="social-username" data-id="${s.id}" value="${s.username || ''}" dir="ltr">
          </div>
          <div class="form-group">
            <label>العنوان المعروض في البطاقة</label>
            <input type="text" class="social-title" data-id="${s.id}" value="${s.title || ''}">
          </div>
          <div class="form-group">
            <label>عدد المتابعين / المشتركين التقريبي</label>
            <input type="text" class="social-subscribers" data-id="${s.id}" value="${s.subscribers || ''}" placeholder="مثال: 100K+">
          </div>
          <div class="form-group full-width">
            <label>الوصف القصير</label>
            <input type="text" class="social-desc" data-id="${s.id}" value="${s.description || ''}">
          </div>
        </div>

        <div style="display: flex; justify-content: flex-end; margin-top: 10px;">
          <button type="button" class="primary-btn save-single-social-btn" data-id="${s.id}">
            <i class="fa-solid fa-check"></i>
            <span>حفظ تعديلات ${s.name}</span>
          </button>
        </div>
      `;

      socialsContainer.appendChild(card);
    });

    // Attach event listeners for each social save button
    document.querySelectorAll('.save-single-social-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        const url = document.querySelector(`.social-url[data-id="${id}"]`).value.trim();
        const username = document.querySelector(`.social-username[data-id="${id}"]`).value.trim();
        const title = document.querySelector(`.social-title[data-id="${id}"]`).value.trim();
        const subscribers = document.querySelector(`.social-subscribers[data-id="${id}"]`).value.trim();
        const description = document.querySelector(`.social-desc[data-id="${id}"]`).value.trim();
        const active = document.querySelector(`.social-toggle[data-id="${id}"]`).checked;

        try {
          const res = await fetch(`/api/admin/socials/${id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': adminToken
            },
            body: JSON.stringify({ url, username, title, subscribers, description, active })
          });

          if (res.ok) {
            showToast(`تم حفظ بيانات ${id} بنجاح! ✅`, 'success');
          } else {
            throw new Error('فشل الحفظ');
          }
        } catch (err) {
          showToast(`حدث خطأ أثناء حفظ ${id}`, 'info');
        }
      });
    });
  }

  // Save YouTube Featured Video ID
  if (saveYtVideoBtn) {
    saveYtVideoBtn.addEventListener('click', async () => {
      const featuredVideoId = ytVideoIdInput.value.trim();
      try {
        const res = await fetch('/api/admin/socials/youtube', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': adminToken
          },
          body: JSON.stringify({ featuredVideoId })
        });

        if (res.ok) {
          showToast('تم تحديث فيديو اليوتيوب المميز بنجاح! 📺', 'success');
        }
      } catch (err) {
        showToast('حدث خطأ أثناء حفظ الفيديو المميز', 'info');
      }
    });
  }

  // Handle Announcer Form Submit
  announcerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const sendBtn = document.getElementById('sendAnnounceBtn');
    sendBtn.disabled = true;
    sendBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري الإرسال للديسكورد...</span>';

    try {
      const payload = {
        platform: announcePlatform.value,
        title: announceTitle.value.trim(),
        link: announceLink.value.trim(),
        message: announceMessage.value.trim()
      };

      const res = await fetch('/api/admin/announce', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': adminToken
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || 'تم إرسال الإشعار بنجاح! 🚀', 'success');
        announceTitle.value = '';
        announceLink.value = '';
        announceMessage.value = '';
        loadAdminData(); // Refresh history
      } else {
        showToast(data.error || 'فشل إرسال الإشعار للديسكورد', 'info');
      }
    } catch (err) {
      showToast('تعذر الاتصال بالبوت أو الخادم', 'info');
    } finally {
      sendBtn.disabled = false;
      sendBtn.innerHTML = '<i class="fa-brands fa-discord"></i> <span>🚀 إرسال الإشعار إلى سيرفر الديسكورد الآن</span>';
    }
  });

  // Populate Announcements History
  function populateAnnouncementsHistory(list) {
    if (!Array.isArray(list) || list.length === 0) {
      announcementsHistoryList.innerHTML = '<p class="empty-history">لا توجد إشعارات سابقة مسجلة.</p>';
      return;
    }

    announcementsHistoryList.innerHTML = '';
    list.slice(0, 15).forEach(item => {
      const row = document.createElement('div');
      row.className = 'history-item';
      row.id = `history-item-${item.id}`;
      row.innerHTML = `
        <div>
          <div class="history-title">${item.title}</div>
          <div class="history-meta">
            <span>المنصة: <strong>${item.platform}</strong></span> • 
            <span>الروم: <strong>#${item.channelName || 'Discord'}</strong></span> • 
            <span>${new Date(item.timestamp).toLocaleString('ar-EG')}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <a href="${item.link}" target="_blank" class="secondary-btn" style="padding: 6px 10px; font-size: 0.82rem;" title="فتح الرابط">
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
          <button type="button" class="delete-announcement-btn" data-id="${item.id}" title="حذف الرسالة والخط الفاصل من الديسكورد">
            <i class="fa-solid fa-trash-can"></i>
            <span>حذف</span>
          </button>
        </div>
      `;
      announcementsHistoryList.appendChild(row);
    });

    // Attach click listeners for delete buttons
    document.querySelectorAll('.delete-announcement-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm('هل تريد بالتأكيد حذف هذه الرسالة والخط الفاصل من سيرفر الديسكورد نهائياً؟')) {
          return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>';

        try {
          const res = await fetch(`/api/admin/announcements/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': adminToken
            }
          });

          const data = await res.json();
          if (res.ok && data.success) {
            showToast(data.message || 'تم حذف الرسالة بنجاح! 🗑️', 'success');
            const rowElem = document.getElementById(`history-item-${id}`);
            if (rowElem) rowElem.remove();
          } else {
            showToast(data.error || 'فشل حذف الرسالة', 'info');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> <span>حذف</span>';
          }
        } catch (err) {
          showToast('حدث خطأ أثناء الاتصال بالخادم', 'info');
          btn.disabled = false;
          btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> <span>حذف</span>';
        }
      });
    });
  }

  // Populate Analytics
  function populateAnalytics(analytics) {
    if (!analytics) return;
    totalViewsVal.textContent = analytics.totalPageViews || 0;

    let totalClicks = 0;
    platformClicksBreakdown.innerHTML = '';

    if (analytics.platformClicks) {
      Object.entries(analytics.platformClicks).forEach(([key, val]) => {
        totalClicks += (val.clicks || 0);

        const row = document.createElement('div');
        row.className = 'click-row';
        row.innerHTML = `
          <div class="click-platform-name">
            <span>${val.name}</span>
          </div>
          <div class="click-count-badge">
            ${val.clicks} نقرة
          </div>
        `;
        platformClicksBreakdown.appendChild(row);
      });
    }

    totalClicksVal.textContent = totalClicks;
  }

  // Populate Bot Settings
  function populateBotSettings(settings, botStatus) {
    if (settings) {
      announceChannelId.value = settings.announcementChannelId || '';
      embedTitleInput.value = settings.customEmbedTitle || '';
      footerTextInput.value = settings.footerText || '';
    }

    updateBotStatusUI(botStatus);
  }

  function updateBotStatusUI(botStatus) {
    if (botStatus && botStatus.online) {
      adminBotBeacon.className = 'status-beacon';
      adminBotTitle.textContent = `🟢 البوت متصل: ${botStatus.tag}`;
      adminBotDetail.textContent = `متصل بـ ${botStatus.guildsCount} سيرفر(ات) | زمن الاستجابة (Ping): ${botStatus.ping}ms`;
    } else {
      adminBotBeacon.className = 'status-beacon offline';
      adminBotTitle.textContent = '🔴 البوت غير متصل حالياً (وضع الاستعداد)';
      adminBotDetail.textContent = 'تأكد من كتابة التوكن DISCORD_TOKEN في ملف .env لإتمام تشغيل البوت.';
    }
  }

  // Save Bot Settings
  botSettingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const payload = {
        announcementChannelId: announceChannelId.value.trim(),
        customEmbedTitle: embedTitleInput.value.trim(),
        footerText: footerTextInput.value.trim()
      };

      const res = await fetch('/api/admin/bot-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': adminToken
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast('تم حفظ إعدادات البوت بنجاح! 🤖', 'success');
      }
    } catch (err) {
      showToast('حدث خطأ أثناء حفظ إعدادات البوت', 'info');
    }
  });

  // Refresh Bot Status Button
  if (refreshBotStatusBtn) {
    refreshBotStatusBtn.addEventListener('click', async () => {
      try {
        const res = await fetch('/api/bot/status');
        const status = await res.json();
        updateBotStatusUI(status);
        showToast('تم تحديث حالة البوت', 'info');
      } catch (err) {
        showToast('فشل فحص حالة البوت', 'info');
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
});
