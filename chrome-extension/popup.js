const VAULTDL_URL = "http://localhost:3000/api/queue";

const PLATFORMS = [
  { name: "instagram", pattern: /instagram\.com/ },
  { name: "tiktok",    pattern: /tiktok\.com/ },
  { name: "youtube",   pattern: /youtube\.com|youtu\.be/ },
];

function detectPlatform(url) {
  for (const { name, pattern } of PLATFORMS) {
    if (pattern.test(url)) return name;
  }
  return null;
}

function applyBadge(platform) {
  const badge = document.getElementById("badge");
  if (platform) {
    badge.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
    badge.className = "badge " + platform;
  } else {
    badge.textContent = "Desteklenmiyor";
    badge.className = "badge unsupported";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const urlBox = document.getElementById("urlBox");
  const addBtn = document.getElementById("addBtn");
  const statusEl = document.getElementById("status");
  let currentUrl = "";

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentUrl = tabs[0]?.url ?? "";
    urlBox.textContent = currentUrl || "URL alınamadı";
    applyBadge(detectPlatform(currentUrl));
  });

  addBtn.addEventListener("click", async () => {
    if (!currentUrl) return;
    addBtn.disabled = true;
    statusEl.textContent = "";
    statusEl.className = "";

    try {
      const res = await fetch(VAULTDL_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: currentUrl }),
      });
      const data = await res.json();
      if (data.success) {
        statusEl.textContent = "✓ Kuyruğa eklendi";
        statusEl.className = "ok";
      } else {
        throw new Error("sunucu hatası");
      }
    } catch {
      statusEl.textContent = "✗ Bağlantı hatası — VaultDL çalışıyor mu?";
      statusEl.className = "err";
    } finally {
      addBtn.disabled = false;
    }
  });
});
