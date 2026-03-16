(() => {
  const VAULTDL_URL = "http://localhost:3000/api/queue";

  const PLATFORM_PATTERNS = [
    { name: "instagram", regex: /instagram\.com\/(?:reel|p|tv)\// },
    { name: "tiktok",    regex: /tiktok\.com\/@.+\/video\// },
    { name: "youtube",   regex: /youtube\.com\/(?:shorts|watch)|youtu\.be\// },
  ];

  function isVideoPage() {
    return PLATFORM_PATTERNS.some(({ regex }) => regex.test(location.href));
  }

  function getButton() {
    return document.getElementById("vaultdl-btn");
  }

  function createButton() {
    const btn = document.createElement("button");
    btn.id = "vaultdl-btn";
    btn.textContent = "⬇ VaultDL";
    btn.style.cssText = `
      position: fixed;
      top: 70px;
      right: 16px;
      z-index: 2147483647;
      padding: 7px 14px;
      background: #4f46e5;
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      font-family: system-ui, sans-serif;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      box-shadow: 0 2px 10px rgba(0,0,0,0.25);
      transition: background 0.15s;
      line-height: 1;
      user-select: none;
    `;

    btn.addEventListener("mouseenter", () => {
      if (!btn.dataset.busy) btn.style.background = "#4338ca";
    });
    btn.addEventListener("mouseleave", () => {
      if (!btn.dataset.busy) btn.style.background = "#4f46e5";
    });

    btn.addEventListener("click", async () => {
      if (btn.dataset.busy) return;
      btn.dataset.busy = "1";
      btn.textContent = "...";
      btn.style.background = "#6366f1";

      try {
        const res = await fetch(VAULTDL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: location.href }),
        });
        const data = await res.json();
        if (data.success) {
          btn.textContent = "✓ Eklendi";
          btn.style.background = "#059669";
        } else {
          throw new Error();
        }
      } catch {
        btn.textContent = "✗ Hata";
        btn.style.background = "#dc2626";
      }

      setTimeout(() => {
        btn.textContent = "⬇ VaultDL";
        btn.style.background = "#4f46e5";
        delete btn.dataset.busy;
      }, 2500);
    });

    return btn;
  }

  function sync() {
    if (isVideoPage()) {
      if (!getButton()) {
        document.body?.appendChild(createButton());
      }
    } else {
      getButton()?.remove();
    }
  }

  // URL değişimini yakala — pushState/replaceState/popstate + MutationObserver
  let lastUrl = location.href;

  function checkUrl() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      sync();
    }
  }

  // pushState / replaceState patch
  for (const method of ["pushState", "replaceState"]) {
    const original = history[method].bind(history);
    history[method] = (...args) => {
      original(...args);
      checkUrl();
    };
  }
  window.addEventListener("popstate", checkUrl);

  // MutationObserver: Instagram popup açılımlarını yakalar
  let debounceTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(checkUrl, 150);
  });

  observer.observe(document.documentElement, {
    subtree: true,
    childList: true,
  });

  // Fallback: bazı navigasyonlar hiçbirini tetiklemez
  setInterval(checkUrl, 1000);

  sync();
})();
