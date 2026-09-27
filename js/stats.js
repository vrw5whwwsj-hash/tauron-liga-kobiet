const COUNT_API = "https://countapi.mileshilliard.com/api/v1";
const KEY_VISITS = "volleynews-tlk-visits-2026";
const KEY_USES = "volleynews-tlk-uses-2026";
const STATS = { visits: null, uses: null };

function trafficLabel(n) {
  if (n >= 100) return t("trafficHot");
  if (n >= 20) return t("trafficMid");
  return t("trafficLow");
}
function trafficClass(n) {
  if (n >= 100) return "hot";
  if (n >= 20) return "mid";
  return "low";
}
function renderStats() {
  const el = document.getElementById("stats-bar");
  if (!el) return;
  const v = STATS.visits;
  const u = STATS.uses;
  el.innerHTML =
    `<span>${t("visits")}: <strong>${v == null ? "\u2014" : v}</strong></span>` +
    `<span>${t("uses")}: <strong>${u == null ? "\u2014" : u}</strong></span>` +
    `<span class="heat ${trafficClass(v || 0)}">${trafficLabel(v || 0)}</span>`;
}
async function countGet(key) {
  const r = await fetch(COUNT_API + "/get/" + key);
  const j = await r.json();
  const n = Number(j.value);
  return Number.isFinite(n) ? n : null;
}
async function countHit(key) {
  const r = await fetch(COUNT_API + "/hit/" + key);
  const j = await r.json();
  const n = Number(j.value);
  return Number.isFinite(n) ? n : null;
}
async function trackVisit() {
  try {
    if (!sessionStorage.getItem("tlk-visit-counted")) {
      STATS.visits = await countHit(KEY_VISITS);
      sessionStorage.setItem("tlk-visit-counted", "1");
    } else {
      STATS.visits = await countGet(KEY_VISITS);
    }
    STATS.uses = await countGet(KEY_USES);
  } catch (e) {}
  renderStats();
}
async function trackUse() {
  try { STATS.uses = await countHit(KEY_USES); } catch (e) {}
  renderStats();
}
