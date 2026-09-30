/**
 * Shared Owner Lounge shell: sidebar, mobile toggle, notifications.
 * Include on owner pages with: <body class="owner-lounge-body" data-owner-page="...">
 * and a <div id="ownerShellRoot"></div> OR existing .owner-lounge structure.
 */
(function () {
  const STORE_KEY = 'leasehub_owner_store_v1';
  const NOTIF_KEY = 'leasehub_owner_notifs_v1';

  function currentUser() {
    try {
      return JSON.parse(localStorage.getItem('leaseHubCurrentUser') || localStorage.getItem('currentUser') || 'null');
    } catch {
      return null;
    }
  }

  function loadNotifs() {
    try {
      return JSON.parse(localStorage.getItem(NOTIF_KEY) || '[]') || [];
    } catch {
      return [];
    }
  }

  function saveNotifs(list) {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(list.slice(0, 50)));
  }

  function seedNotifsFromData() {
    const user = currentUser();
    if (!user) return;
    const list = loadNotifs();
    if (list.length) return;
    const seeded = [
      { id: 'tip1', type: 'tip', title: 'Welcome to Owner Lounge', body: 'Add a property and complete store appearance.', read: false, at: Date.now() },
      { id: 'tip2', type: 'tip', title: 'Respond fast', body: 'Quick replies to viewings improve conversion.', read: false, at: Date.now() - 1000 }
    ];
    saveNotifs(seeded);
  }

  function unreadCount() {
    return loadNotifs().filter((n) => !n.read).length;
  }

  function sidebarHTML(active) {
    const user = currentUser();
    const name = user?.name || 'Owner';
    const initial = name.trim().charAt(0).toUpperCase() || 'O';
    const item = (href, key, icon, label) =>
      `<a href="${href}" class="owner-nav-item${active === key ? ' is-active' : ''}"><i class="bx ${icon}"></i><span>${label}</span></a>`;
    return `
<aside class="owner-sidebar" id="ownerSidebar">
  <div class="owner-sidebar-top">
    <a href="index.html" class="owner-sidebar-brand">
      <img src="IMAGES/Lease Hub logo.png" alt="LeaseHub">
      <div><strong>LeaseHub</strong><span>Owner Lounge</span></div>
    </a>
    <button type="button" class="owner-sidebar-hide" id="ownerSidebarHide" aria-label="Hide menu"><i class="bx bx-chevron-left"></i></button>
  </div>
  <nav class="owner-sidebar-nav">
    ${item('owner-dashboard.html', 'dashboard', 'bx-grid-alt', 'Dashboard')}
    ${item('owner-dashboard.html#myProperties', 'properties', 'bx-building-house', 'Properties')}
    ${item('add-property.html', 'add', 'bx-plus-circle', 'Add property')}
    ${item('owner-dashboard.html#ownerViewings', 'viewings', 'bx-calendar', 'Viewings')}
    ${item('owner-dashboard.html#ownerApplications', 'applications', 'bx-file', 'Applications')}
    ${item('owner-messages.html', 'messages', 'bx-message-rounded', 'Messages')}
    ${item('owner-dashboard.html#ownerStore', 'store', 'bx-store', 'My Store')}
    ${item('owner-storefront.html', 'storefront', 'bx-store-alt', 'Public storefront')}
    ${item('owner-payments.html', 'payments', 'bx-wallet', 'Payments')}
    ${item('owner-dashboard.html#ownerPlan', 'plan', 'bx-diamond', 'Plan')}
  </nav>
  <div class="owner-sidebar-foot">
    <div class="owner-sidebar-user">
      <span class="owner-avatar">${initial}</span>
      <div><strong>${name}</strong><small>Property owner</small></div>
    </div>
    <a href="properties.html" class="owner-exit-link"><i class="bx bx-log-out"></i> Exit to Marketplace</a>
  </div>
</aside>
<div class="owner-sidebar-overlay" id="ownerSidebarOverlay"></div>`;
  }

  function topbarHTML(title) {
    const count = unreadCount();
    return `
<header class="owner-topbar">
  <button type="button" class="owner-menu-toggle" id="ownerMenuToggle" aria-label="Open menu"><i class="bx bx-menu"></i></button>
  <div class="owner-topbar-title">
    <span class="owner-eyebrow">OWNER LOUNGE</span>
    <h1>${title}</h1>
  </div>
  <div class="owner-topbar-actions">
    <div class="owner-notif-wrap">
      <button type="button" class="owner-ghost-btn owner-notif-btn" id="ownerNotifBtn" aria-label="Notifications">
        <i class="bx bx-bell"></i>
        <span class="owner-notif-badge" id="ownerNotifBadge" ${count ? '' : 'hidden'}>${count}</span>
      </button>
      <div class="owner-notif-panel" id="ownerNotifPanel" hidden>
        <div class="owner-notif-head">
          <strong>Notifications</strong>
          <button type="button" id="ownerNotifReadAll">Mark all read</button>
        </div>
        <div id="ownerNotifList" class="owner-notif-list"></div>
      </div>
    </div>
    <a href="properties.html" class="owner-ghost-btn">Exit to Marketplace</a>
  </div>
</header>`;
  }

  function renderNotifList() {
    const list = document.getElementById('ownerNotifList');
    if (!list) return;
    const items = loadNotifs();
    if (!items.length) {
      list.innerHTML = '<p class="owner-muted">No notifications yet.</p>';
      return;
    }
    list.innerHTML = items
      .map(
        (n) => `<article class="owner-notif-item ${n.read ? '' : 'is-unread'}">
        <strong>${escapeHtml(n.title || 'Update')}</strong>
        <p>${escapeHtml(n.body || '')}</p>
      </article>`
      )
      .join('');
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function setupChrome() {
    const lounge = document.querySelector('.owner-lounge');
    if (!lounge) return;
    const openBtn = document.getElementById('ownerMenuToggle');
    const closeBtn = document.getElementById('ownerSidebarHide');
    const overlay = document.getElementById('ownerSidebarOverlay');
    openBtn?.addEventListener('click', () => lounge.classList.add('sidebar-open'));
    closeBtn?.addEventListener('click', () => lounge.classList.remove('sidebar-open'));
    overlay?.addEventListener('click', () => lounge.classList.remove('sidebar-open'));

    seedNotifsFromData();
    renderNotifList();
    const badge = document.getElementById('ownerNotifBadge');
    const panel = document.getElementById('ownerNotifPanel');
    document.getElementById('ownerNotifBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!panel) return;
      panel.hidden = !panel.hidden;
    });
    document.getElementById('ownerNotifReadAll')?.addEventListener('click', () => {
      const items = loadNotifs().map((n) => ({ ...n, read: true }));
      saveNotifs(items);
      renderNotifList();
      if (badge) {
        badge.hidden = true;
        badge.textContent = '0';
      }
    });
    document.addEventListener('click', () => {
      if (panel) panel.hidden = true;
    });
    panel?.addEventListener('click', (e) => e.stopPropagation());
  }

  /** Wrap page content if only #ownerShellMount exists */
  function maybeBuildShell() {
    const mount = document.getElementById('ownerShellMount');
    if (!mount) {
      setupChrome();
      return;
    }
    const page = document.body.getAttribute('data-owner-page') || 'dashboard';
    const title = document.body.getAttribute('data-owner-title') || 'Owner Lounge';
    const activeMap = {
      dashboard: 'dashboard',
      messages: 'messages',
      add: 'add',
      storefront: 'storefront',
      payments: 'payments'
    };
    const active = activeMap[page] || page;
    const content = mount.innerHTML;
    mount.outerHTML = `
<div class="owner-lounge">
  ${sidebarHTML(active)}
  <div class="owner-main">
    ${topbarHTML(title)}
    <main class="owner-content">${content}</main>
  </div>
</div>`;
    setupChrome();
  }

  window.LeaseHubOwnerShell = {
    loadNotifs,
    saveNotifs,
    pushNotif(title, body, type = 'info') {
      const items = loadNotifs();
      items.unshift({ id: String(Date.now()), type, title, body, read: false, at: Date.now() });
      saveNotifs(items);
    }
  };

  document.addEventListener('DOMContentLoaded', maybeBuildShell);
})();
