(function () {
  const STORE_KEY = "leasehub_owner_store_v1";
  const tips = [
    {
      title: "Sharp property photos",
      text: "High-quality images usually attract more tenants in the marketplace."
    },
    {
      title: "Clear rent and fees",
      text: "List service charge and agency fee up front so applications stay serious."
    },
    {
      title: "Respond to viewings fast",
      text: "Owners who reply quickly convert more viewing requests into applications."
    }
  ];

  function loadStore() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {};
    } catch {
      return {};
    }
  }

  function saveStore(data) {
    localStorage.setItem(STORE_KEY, JSON.stringify(data));
  }

  function applyStoreToUI(data) {
    const name = data.name || "";
    const tagline = data.tagline || "";
    const goal = data.goal || "";
    const banner = data.banner || "";
    const logo = data.logo || "";

    const nameInput = document.getElementById("ownerStoreNameInput");
    const taglineInput = document.getElementById("ownerStoreTaglineInput");
    const goalInput = document.getElementById("ownerStoreGoalInput");
    if (nameInput && !nameInput.value) nameInput.value = name;
    if (taglineInput && !taglineInput.value) taglineInput.value = tagline;
    if (goalInput && !goalInput.value) goalInput.value = goal;

    const liveName = document.getElementById("liveStoreName");
    const liveTagline = document.getElementById("liveStoreTagline");
    const liveGoal = document.getElementById("liveStoreGoal");
    const liveBanner = document.getElementById("liveBannerText");
    const liveLogo = document.getElementById("liveLogoText");
    const bannerPreview = document.getElementById("ownerBannerPreview");
    const logoPreview = document.getElementById("ownerLogoPreview");
    const storeTitle = document.getElementById("ownerStoreTitle");

    if (liveName) liveName.textContent = nameInput?.value || name || "LeaseHub Owner";
    if (liveTagline) liveTagline.textContent = taglineInput?.value || tagline || "Explore this store";
    if (liveGoal) liveGoal.textContent = goalInput?.value || goal || "List quality homes";
    if (storeTitle && (nameInput?.value || name)) storeTitle.textContent = nameInput?.value || name;

    if (banner) {
      if (liveBanner) {
        liveBanner.textContent = "";
        liveBanner.style.backgroundImage = `url("${banner}")`;
      }
      if (bannerPreview) {
        bannerPreview.style.backgroundImage = `url("${banner}")`;
        bannerPreview.style.backgroundSize = "cover";
        const span = bannerPreview.querySelector("span");
        if (span) span.style.display = "none";
      }
    }

    if (logo) {
      if (liveLogo) liveLogo.innerHTML = `<img src="${logo}" alt="Logo">`;
      if (logoPreview) logoPreview.innerHTML = `<img src="${logo}" alt="Logo">`;
    }
  }

  function syncLiveFromInputs() {
    const data = loadStore();
    data.name = document.getElementById("ownerStoreNameInput")?.value || data.name || "";
    data.tagline = document.getElementById("ownerStoreTaglineInput")?.value || data.tagline || "";
    data.goal = document.getElementById("ownerStoreGoalInput")?.value || data.goal || "";
    applyStoreToUI(data);
  }

  function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function setupSidebar() {
    const lounge = document.querySelector(".owner-lounge");
    const openBtn = document.getElementById("ownerMenuToggle");
    const closeBtn = document.getElementById("ownerSidebarHide");
    const overlay = document.getElementById("ownerSidebarOverlay");
    const open = () => lounge?.classList.add("sidebar-open");
    const close = () => lounge?.classList.remove("sidebar-open");
    openBtn?.addEventListener("click", open);
    closeBtn?.addEventListener("click", close);
    overlay?.addEventListener("click", close);
  }

  function setupTips() {
    const tip = tips[Math.floor(Math.random() * tips.length)];
    const title = document.getElementById("ownerTipTitle");
    const text = document.getElementById("ownerTipText");
    if (title) title.textContent = tip.title;
    if (text) text.textContent = tip.text;
  }

  function setupStore() {
    const data = loadStore();
    applyStoreToUI(data);

    ["ownerStoreNameInput", "ownerStoreTaglineInput", "ownerStoreGoalInput"].forEach((id) => {
      document.getElementById(id)?.addEventListener("input", syncLiveFromInputs);
    });

    document.getElementById("ownerBannerBtn")?.addEventListener("click", () => {
      document.getElementById("ownerBannerInput")?.click();
    });
    document.getElementById("ownerLogoBtn")?.addEventListener("click", () => {
      document.getElementById("ownerLogoInput")?.click();
    });

    document.getElementById("ownerBannerInput")?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const url = await readFileAsDataURL(file);
      const stored = loadStore();
      stored.banner = url;
      saveStore(stored);
      applyStoreToUI(stored);
    });

    document.getElementById("ownerLogoInput")?.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const url = await readFileAsDataURL(file);
      const stored = loadStore();
      stored.logo = url;
      saveStore(stored);
      applyStoreToUI(stored);
    });

    document.getElementById("ownerSaveStoreBtn")?.addEventListener("click", () => {
      const stored = loadStore();
      stored.name = document.getElementById("ownerStoreNameInput")?.value?.trim() || "";
      stored.tagline = document.getElementById("ownerStoreTaglineInput")?.value?.trim() || "";
      stored.goal = document.getElementById("ownerStoreGoalInput")?.value?.trim() || "";
      saveStore(stored);
      applyStoreToUI(stored);
      alert("Store appearance saved on this device.");
    });

    document.querySelectorAll("[data-owner-plan]").forEach((button) => {
      button.addEventListener("click", () => {
        const notice = document.getElementById("ownerPlanNotice");
        if (!notice) return;
        notice.textContent = `${button.dataset.ownerPlan} checkout is not connected yet. Your current plan has not changed.`;
        notice.hidden = false;
      });
    });

    document.getElementById("ownerRefreshBtn")?.addEventListener("click", () => {
      window.location.reload();
    });
  }

  function syncCountsToStorefront() {
    const count = document.getElementById("ownerListingCount")?.textContent || "0";
    const chip = document.getElementById("liveProductChip");
    const label = document.getElementById("ownerStoreProductCount");
    if (chip) chip.textContent = `${count} properties`;
    if (label) label.textContent = `${count} properties`;
    const pts = document.getElementById("ownerEngagementPts");
    if (pts) {
      const n = Number(count) || 0;
      pts.textContent = `${n * 3 + 3} pts`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.classList.contains("owner-lounge-body")) return;
    setupSidebar();
    setupTips();
    setupStore();
    // Wait a tick for app.js owner dashboard render
    window.setTimeout(syncCountsToStorefront, 200);
    window.setTimeout(syncCountsToStorefront, 800);
  });
})();
