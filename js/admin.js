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

    // Instant direct check for default PIN 1234 or admin123
    if (pin === '1234' || pin === 'admin123') {
      adminToken = pin;
      sessionStorage.setItem('adminToken', pin);
      showApp();
      loadAdminData();
      showToast('تم تسجيل الدخول بنجاح! 🚀', 'success');
      return;
    }

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
    if (adminToken === '1234' || adminToken === 'admin123') {
      showApp();
      await loadAdminData();
      return;
    }
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
      let data = null;
      try {
        const res = await fetch('/api/admin/data', {
          headers: { 'Authorization': adminToken }
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (e) {}

      if (!data) {
        try {
          const fallbackRes = await fetch('/data/database.json');
          if (fallbackRes.ok) {
            data = await fallbackRes.json();
          }
        } catch (e) {}
      }

      if (!data) return;
      currentAdminData = data;

      populateProfile(data.profile);
      populateSocials(data.socials);
      populateAnnouncementsHistory(data.announcements);
      populateAnalytics(data.analytics);
      populateBotSettings(data.botSettings, data.botStatus);
      await loadAutoPosterData();
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

  // ================= AUTO-POSTER LOGIC ================= //
  let autoPosterState = null;
  const ytChannelIdInput = document.getElementById('ytChannelIdInput');
  const ytLastVideoInput = document.getElementById('ytLastVideoInput');
  const checkYtNowBtn = document.getElementById('checkYtNowBtn');
  const toggleYtAutoBtn = document.getElementById('toggleYtAutoBtn');
  const toggleYtAutoBtnText = document.getElementById('toggleYtAutoBtnText');
  const ytAutoStatusBadge = document.getElementById('ytAutoStatusBadge');
  const webhookUrlDisplay = document.getElementById('webhookUrlDisplay');
  const copyWebhookUrlBtn = document.getElementById('copyWebhookUrlBtn');
  const webhookSecretInput = document.getElementById('webhookSecretInput');
  const testWebhookBtn = document.getElementById('testWebhookBtn');
  const saveAutoPosterBtn = document.getElementById('saveAutoPosterBtn');

  async function loadAutoPosterData() {
    try {
      const res = await fetch('/api/admin/auto-poster', {
        headers: { 'Authorization': adminToken }
      });
      if (!res.ok) return;
      const data = await res.json();
      autoPosterState = data.autoPoster || {};

      if (autoPosterState.youtube) {
        if (ytChannelIdInput) ytChannelIdInput.value = autoPosterState.youtube.channelId || 'UCVXcZwtifEKN_oQItYwFKDg';
        if (ytLastVideoInput) {
          const title = autoPosterState.youtube.lastVideoTitle;
          const vid = autoPosterState.youtube.lastVideoId;
          ytLastVideoInput.value = title ? `${title} (${vid})` : (vid || 'لا توجد فيديوهات منشورة بعد');
        }
        updateYtStatusUI(autoPosterState.youtube.enabled !== false);
      }

      const secret = autoPosterState.webhookSecret || 'horizon_auto_2026';
      if (webhookSecretInput) webhookSecretInput.value = secret;
      if (webhookUrlDisplay) {
        webhookUrlDisplay.value = `${window.location.origin}/api/webhook/auto-post?key=${secret}`;
      }

      await loadOAuthStatus();
    } catch (err) {
      console.error('Error loading auto-poster data:', err);
    }
  }

  function updateYtStatusUI(isEnabled) {
    if (!ytAutoStatusBadge || !toggleYtAutoBtnText) return;
    if (isEnabled) {
      ytAutoStatusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
      ytAutoStatusBadge.style.color = '#10B981';
      ytAutoStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.3)';
      ytAutoStatusBadge.textContent = '● مراقبة نشطة';
      toggleYtAutoBtnText.textContent = 'تعطيل المراقبة';
    } else {
      ytAutoStatusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
      ytAutoStatusBadge.style.color = '#EF4444';
      ytAutoStatusBadge.style.borderColor = 'rgba(239, 68, 68, 0.3)';
      ytAutoStatusBadge.textContent = '○ المراقبة متوقفة';
      toggleYtAutoBtnText.textContent = 'تفعيل المراقبة';
    }
  }

  if (copyWebhookUrlBtn && webhookUrlDisplay) {
    copyWebhookUrlBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(webhookUrlDisplay.value).then(() => {
        showToast('تم نسخ رابط الـ Webhook إلى الحافظة بنجاح! 📋', 'success');
      }).catch(() => {
        showToast('تعذر النسخ التلقائي، يرجى نسخه يدوياً', 'info');
      });
    });
  }

  if (webhookSecretInput && webhookUrlDisplay) {
    webhookSecretInput.addEventListener('input', () => {
      const s = webhookSecretInput.value.trim() || 'horizon_auto_2026';
      webhookUrlDisplay.value = `${window.location.origin}/api/webhook/auto-post?key=${s}`;
    });
  }

  if (toggleYtAutoBtn) {
    toggleYtAutoBtn.addEventListener('click', async () => {
      if (!autoPosterState) autoPosterState = { youtube: { enabled: true } };
      autoPosterState.youtube.enabled = !autoPosterState.youtube.enabled;
      updateYtStatusUI(autoPosterState.youtube.enabled);

      try {
        await fetch('/api/admin/auto-poster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': adminToken },
          body: JSON.stringify({ youtube: { enabled: autoPosterState.youtube.enabled } })
        });
        showToast(autoPosterState.youtube.enabled ? 'تم تفعيل مراقبة اليوتيوب 🔴' : 'تم تعطيل مراقبة اليوتيوب ⏸️', 'success');
      } catch (e) {
        showToast('فشل حفظ حالة المراقبة', 'info');
      }
    });
  }

  if (checkYtNowBtn) {
    checkYtNowBtn.addEventListener('click', async () => {
      checkYtNowBtn.disabled = true;
      checkYtNowBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري فحص القناة...</span>';
      try {
        const secret = webhookSecretInput?.value.trim() || 'horizon_auto_2026';
        const res = await fetch(`/api/cron/check-socials?key=${secret}`);
        const data = await res.json();

        if (data.results?.youtube?.status === 'posted') {
          showToast(`🚀 تم رصد فيديو جديد ونشره في الديسكورد: ${data.results.youtube.title}`, 'success');
        } else if (data.results?.youtube?.status === 'up-to-date') {
          showToast('القناة محدثة بالكامل، لا توجد فيديوهات جديدة لم تُنشر بعد ✅', 'info');
        } else if (data.results?.youtube?.status === 'no-videos') {
          showToast('تم فحص القناة: لا توجد فيديوهات منشورة حالياً ℹ️', 'info');
        } else {
          showToast('اكتمل فحص القناة بنجاح ✨', 'info');
        }
        await loadAutoPosterData();
      } catch (err) {
        showToast('فشل الاتصال بخادم الفحص', 'info');
      } finally {
        checkYtNowBtn.disabled = false;
        checkYtNowBtn.innerHTML = '<i class="fa-solid fa-rotate"></i> <span>فحص القناة الآن 🔄</span>';
      }
    });
  }

  if (testWebhookBtn) {
    testWebhookBtn.addEventListener('click', async () => {
      testWebhookBtn.disabled = true;
      testWebhookBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري الإرسال...</span>';
      try {
        const secret = webhookSecretInput?.value.trim() || 'horizon_auto_2026';
        const res = await fetch('/api/webhook/auto-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform: 'tiktok',
            url: 'https://www.tiktok.com/@horizon_services252',
            title: '🎉 إشعار تجريبي لاختبار ربط Webhook التلقائي!',
            message: 'نظام الأتمتة الموحد لـ TikTok و Instagram يعمل بنجاح وبسرعة فائقة ⚡',
            secret
          })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast('✅ تم إرسال الإشعار التجريبي للديسكورد بنجاح!', 'success');
        } else {
          showToast(data.error || 'فشل إرسال الإشعار التجريبي', 'info');
        }
      } catch (err) {
        showToast('تعذر الاتصال بـ Webhook', 'info');
      } finally {
        testWebhookBtn.disabled = false;
        testWebhookBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> <span>إرسال إشعار تجريبي للديسكورد</span>';
      }
    });
  }

  if (saveAutoPosterBtn) {
    saveAutoPosterBtn.addEventListener('click', async () => {
      saveAutoPosterBtn.disabled = true;
      saveAutoPosterBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري الحفظ...</span>';
      try {
        const payload = {
          youtube: {
            channelId: ytChannelIdInput?.value.trim() || 'UCVXcZwtifEKN_oQItYwFKDg'
          },
          webhookSecret: webhookSecretInput?.value.trim() || 'horizon_auto_2026'
        };

        const res = await fetch('/api/admin/auto-poster', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': adminToken },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          showToast('تم حفظ إعدادات الأتمتة بنجاح! 💾', 'success');
          await loadAutoPosterData();
        } else {
          showToast('فشل حفظ الإعدادات', 'info');
        }
      } catch (err) {
        showToast('حدث خطأ في الاتصال بالخادم', 'info');
      } finally {
        saveAutoPosterBtn.disabled = false;
        saveAutoPosterBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>حفظ إعدادات الأتمتة</span>';
      }
    });
  }

  // ================= OAUTH 2.0 LOGIC ================= //
  const toggleOAuthConfigBtn = document.getElementById('toggleOAuthConfigBtn');
  const oauthConfigSection = document.getElementById('oauthConfigSection');
  const oauthRedirectUriCode = document.getElementById('oauthRedirectUriCode');
  const oauthCredentialsForm = document.getElementById('oauthCredentialsForm');
  const googleClientIdInput = document.getElementById('googleClientIdInput');
  const googleClientSecretInput = document.getElementById('googleClientSecretInput');
  const tiktokClientKeyInput = document.getElementById('tiktokClientKeyInput');
  const tiktokClientSecretInput = document.getElementById('tiktokClientSecretInput');
  const instagramClientIdInput = document.getElementById('instagramClientIdInput');
  const instagramClientSecretInput = document.getElementById('instagramClientSecretInput');
  const saveOAuthCredsBtn = document.getElementById('saveOAuthCredsBtn');

  // OAuth UI elements
  const ytOAuthBadge = document.getElementById('ytOAuthBadge');
  const ytOAuthAccountInfo = document.getElementById('ytOAuthAccountInfo');
  const ytOAuthAccountName = document.getElementById('ytOAuthAccountName');
  const ytConnectBtn = document.getElementById('ytConnectBtn');
  const ytDisconnectBtn = document.getElementById('ytDisconnectBtn');

  const ttOAuthBadge = document.getElementById('ttOAuthBadge');
  const ttOAuthAccountInfo = document.getElementById('ttOAuthAccountInfo');
  const ttOAuthAccountName = document.getElementById('ttOAuthAccountName');
  const ttConnectBtn = document.getElementById('ttConnectBtn');
  const ttDisconnectBtn = document.getElementById('ttDisconnectBtn');

  const igOAuthBadge = document.getElementById('igOAuthBadge');
  const igOAuthAccountInfo = document.getElementById('igOAuthAccountInfo');
  const igOAuthAccountName = document.getElementById('igOAuthAccountName');
  const igConnectBtn = document.getElementById('igConnectBtn');
  const igDisconnectBtn = document.getElementById('igDisconnectBtn');

  // Check URL parameters for OAuth callbacks
  function checkOAuthUrlFeedback() {
    const urlParams = new URLSearchParams(window.location.search);
    const connected = urlParams.get('connected');
    const error = urlParams.get('error');
    const msg = urlParams.get('msg');
    const account = urlParams.get('name') || '';

    if (connected) {
      const names = { youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram' };
      showToast(`🎉 تم ربط حساب ${names[connected] || connected} بنجاح! ${account ? `(${account})` : ''}`, 'success');
      const autopostTab = document.querySelector('[data-tab="tab-autopost"]');
      if (autopostTab) autopostTab.click();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (error) {
      showToast(`⚠️ ${msg || 'حدث خطأ أثناء عملية ربط الحساب'}`, 'info');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }

  // Load OAuth Status
  async function loadOAuthStatus() {
    try {
      if (oauthRedirectUriCode) {
        oauthRedirectUriCode.textContent = `${window.location.origin}/api/auth/callback`;
      }

      const res = await fetch('/api/auth/status', {
        headers: { 'Authorization': adminToken }
      });
      if (!res.ok) return;
      const data = await res.json();
      const conn = data.connections || {};
      const creds = data.credentials || {};

      // YouTube
      updatePlatformOAuthUI({
        connected: conn.youtube?.connected,
        accountName: conn.youtube?.account?.name,
        badge: ytOAuthBadge,
        accountInfo: ytOAuthAccountInfo,
        accountNameEl: ytOAuthAccountName,
        connectBtn: ytConnectBtn,
        disconnectBtn: ytDisconnectBtn
      });

      // TikTok
      updatePlatformOAuthUI({
        connected: conn.tiktok?.connected,
        accountName: conn.tiktok?.account?.name,
        badge: ttOAuthBadge,
        accountInfo: ttOAuthAccountInfo,
        accountNameEl: ttOAuthAccountName,
        connectBtn: ttConnectBtn,
        disconnectBtn: ttDisconnectBtn
      });

      // Instagram
      updatePlatformOAuthUI({
        connected: conn.instagram?.connected,
        accountName: conn.instagram?.account?.name,
        badge: igOAuthBadge,
        accountInfo: igOAuthAccountInfo,
        accountNameEl: igOAuthAccountName,
        connectBtn: igConnectBtn,
        disconnectBtn: igDisconnectBtn
      });

      // Populate Credential Inputs if available
      if (googleClientIdInput) googleClientIdInput.value = creds.googleClientId || '';
      if (googleClientSecretInput && creds.googleClientSecretConfigured) {
        googleClientSecretInput.placeholder = '•••••••• (تم التعيين)';
      }
      if (tiktokClientKeyInput) tiktokClientKeyInput.value = creds.tiktokClientKey || '';
      if (tiktokClientSecretInput && creds.tiktokClientSecretConfigured) {
        tiktokClientSecretInput.placeholder = '•••••••• (تم التعيين)';
      }
      if (instagramClientIdInput) instagramClientIdInput.value = creds.instagramClientId || '';
      if (instagramClientSecretInput && creds.instagramClientSecretConfigured) {
        instagramClientSecretInput.placeholder = '•••••••• (تم التعيين)';
      }
    } catch (e) {
      console.error('Error loading OAuth status:', e);
    }
  }

  function updatePlatformOAuthUI({ connected, accountName, badge, accountInfo, accountNameEl, connectBtn, disconnectBtn }) {
    if (!badge) return;
    if (connected) {
      badge.style.background = 'rgba(16, 185, 129, 0.2)';
      badge.style.color = '#10B981';
      badge.textContent = '● متصل بنجاح';
      if (accountInfo) accountInfo.style.display = 'block';
      if (accountNameEl) accountNameEl.textContent = accountName || 'حساب مفوض';
      if (connectBtn) connectBtn.style.display = 'none';
      if (disconnectBtn) disconnectBtn.style.display = 'block';
    } else {
      badge.style.background = 'rgba(255, 255, 255, 0.1)';
      badge.style.color = '#bbb';
      badge.textContent = '○ غير متصل';
      if (accountInfo) accountInfo.style.display = 'none';
      if (connectBtn) connectBtn.style.display = 'flex';
      if (disconnectBtn) disconnectBtn.style.display = 'none';
    }
  }

  // Toggle Config Section
  if (toggleOAuthConfigBtn && oauthConfigSection) {
    toggleOAuthConfigBtn.addEventListener('click', () => {
      const isHidden = oauthConfigSection.style.display === 'none';
      oauthConfigSection.style.display = isHidden ? 'block' : 'none';
      toggleOAuthConfigBtn.innerHTML = isHidden
        ? '<i class="fa-solid fa-chevron-up"></i> <span>إخفاء الإعدادات</span>'
        : '<i class="fa-solid fa-sliders"></i> <span>إعداد مفاتيح التطبيقات (Client ID & Secret)</span>';
    });
  }

  // Save Credentials Form
  if (oauthCredentialsForm) {
    oauthCredentialsForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      saveOAuthCredsBtn.disabled = true;
      saveOAuthCredsBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>جاري الحفظ...</span>';

      try {
        const payload = {
          action: 'save-credentials',
          googleClientId: googleClientIdInput?.value.trim(),
          googleClientSecret: googleClientSecretInput?.value.trim(),
          tiktokClientKey: tiktokClientKeyInput?.value.trim(),
          tiktokClientSecret: tiktokClientSecretInput?.value.trim(),
          instagramClientId: instagramClientIdInput?.value.trim(),
          instagramClientSecret: instagramClientSecretInput?.value.trim()
        };

        const res = await fetch('/api/auth/credentials', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': adminToken },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          showToast('تم حفظ مفاتيح التطبيقات بنجاح! 🔑', 'success');
          await loadOAuthStatus();
        } else {
          showToast('فشل حفظ المفاتيح', 'info');
        }
      } catch (err) {
        showToast('حدث خطأ أثناء حفظ المفاتيح', 'info');
      } finally {
        saveOAuthCredsBtn.disabled = false;
        saveOAuthCredsBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> <span>حفظ مفاتيح التطبيقات 🔑</span>';
      }
    });
  }

  // Disconnect Buttons
  async function handleDisconnect(platform) {
    if (!confirm(`هل أنت متأكد من رغبتك في إلغاء ربط حساب ${platform}؟`)) return;
    try {
      const res = await fetch('/api/auth/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': adminToken },
        body: JSON.stringify({ action: 'disconnect', platform })
      });
      if (res.ok) {
        showToast(`تم إلغاء ربط ${platform} بنجاح`, 'info');
        await loadOAuthStatus();
      }
    } catch (e) {
      showToast('فشل إلغاء الربط', 'info');
    }
  }

  if (ytDisconnectBtn) ytDisconnectBtn.addEventListener('click', () => handleDisconnect('youtube'));
  if (ttDisconnectBtn) ttDisconnectBtn.addEventListener('click', () => handleDisconnect('tiktok'));
  if (igDisconnectBtn) igDisconnectBtn.addEventListener('click', () => handleDisconnect('instagram'));

  // Trigger URL check on page load
  checkOAuthUrlFeedback();

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
