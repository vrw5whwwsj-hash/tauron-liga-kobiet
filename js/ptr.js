(function () {
  const THRESH = 72;
  const bar = document.createElement("div");
  bar.id = "ptr-bar";
  bar.textContent = "↓";
  document.documentElement.prepend(bar);
  let y0 = 0, pulling = false, armed = false;
  function atTop() {
    return (window.scrollY || document.documentElement.scrollTop || 0) <= 2;
  }
  async function reloadFresh() {
    bar.classList.add("busy");
    bar.textContent = "…";
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.update()));
      }
    } catch (e) {}
    location.reload();
  }
  document.addEventListener("touchstart", (e) => {
    if (!atTop()) { pulling = false; return; }
    y0 = e.touches[0].clientY;
    pulling = true;
    armed = false;
  }, { passive: true });
  document.addEventListener("touchmove", (e) => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - y0;
    if (dy < 8 || !atTop()) { bar.style.height = "0"; return; }
    const h = Math.min(96, dy * 0.45);
    bar.style.height = h + "px";
    armed = h >= THRESH * 0.45;
    bar.textContent = armed ? "↑" : "↓";
  }, { passive: true });
  document.addEventListener("touchend", () => {
    if (!pulling) return;
    pulling = false;
    if (armed) reloadFresh();
    else bar.style.height = "0";
    armed = false;
  }, { passive: true });
})();
