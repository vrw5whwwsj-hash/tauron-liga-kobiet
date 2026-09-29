const TEAM = {};
let SEASON = null;
let MATCHES = null;
let SCORERS = null;
let NEWS = { items: [] };
const emptyStats = () => ({ played: 0, pts: 0, w: 0, l: 0, sw: 0, sl: 0, pw: 0, pl: 0 });
function setRatio(a, b) { if (!b && !a) return 0; if (!b) return a > 0 ? 999 : 0; return a / b; }
function computeTable(teams, rounds) {
  const map = {};
  teams.forEach((x) => { map[x.id] = { ...x, ...emptyStats() }; });
  rounds.forEach((r) => {
    (r.matches || []).forEach((m) => {
      if (!m.score || !Array.isArray(m.sets) || m.sets.length < 3) return;
      const home = map[m.home], away = map[m.away];
      if (!home || !away) return;
      const hs = m.score[0], as = m.score[1];
      home.played++; away.played++;
      home.sw += hs; home.sl += as; away.sw += as; away.sl += hs;
      m.sets.forEach(([hp, ap]) => { home.pw += hp; home.pl += ap; away.pw += ap; away.pl += hp; });
      if (hs > as) { home.w++; away.l++; } else { away.w++; home.l++; }
      const hp = hs === 3 && as <= 1 ? 3 : hs === 3 ? 2 : as === 3 && hs === 2 ? 1 : 0;
      const ap = as === 3 && hs <= 1 ? 3 : as === 3 ? 2 : hs === 3 && as === 2 ? 1 : 0;
      home.pts += hp; away.pts += ap;
    });
  });
  const rows = Object.values(map);
  rows.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.w !== a.w) return b.w - a.w;
    const srA = setRatio(a.sw, a.sl), srB = setRatio(b.sw, b.sl);
    if (srB !== srA) return srB - srA;
    const prA = setRatio(a.pw, a.pl), prB = setRatio(b.pw, b.pl);
    if (prB !== prA) return prB - prA;
    return a.name.localeCompare(b.name, LANG === "tr" ? "tr" : LANG === "en" ? "en" : "pl");
  });
  return rows;
}
function fmtRatio(a, b) { if (!a && !b) return "\u2014"; return setRatio(a, b).toFixed(3); }
function teamName(id) { return TEAM[id]?.name || id; }
function teamShort(id) { return TEAM[id]?.short || id; }
function pick(obj, plKey, enKey, trKey) {
  if (!obj) return "";
  if (LANG === "tr" && trKey && obj[trKey]) return obj[trKey];
  if (LANG === "tr" && obj[enKey]) return obj[enKey];
  if (LANG === "en" && obj[enKey]) return obj[enKey];
  return obj[plKey] || obj[enKey] || "";
}
function clipBtn(url, label) {
  if (!url) return "";
  const lab = label || (LANG === "en" ? "Match highlights" : LANG === "tr" ? "Maç özeti" : "Skrót meczu");
  return `<p class="clip-wrap"><a class="clip-btn" href="${url}" target="_blank" rel="noopener">${lab}</a></p>`;
}
function confLabel(c) {
  if (LANG === "en") return ({ wysoka: "high", "\u015brednia": "medium", "\u015brednia+": "medium+", niska: "low" }[c]) || c || "";
  if (LANG === "tr") return ({ wysoka: "y\u00fcksek", "\u015brednia": "orta", "\u015brednia+": "orta+", niska: "d\u00fc\u015f\u00fck" }[c]) || c || "";
  return c || "";
}
function renderTable(rows) {
  const body = rows.map((x, i) => {
    const cls = i < 8 ? "po" : i === 11 ? "rel" : "";
    return `<tr class="${cls}"><td class="pos">${i + 1}</td><td class="team">${x.name}</td><td>${x.played}</td><td><strong>${x.pts}</strong></td><td>${x.w}-${x.l}</td><td>${x.sw}:${x.sl}</td><td>${fmtRatio(x.sw, x.sl)}</td><td>${fmtRatio(x.pw, x.pl)}</td></tr>`;
  }).join("");
  document.getElementById("table-wrap").innerHTML = `<div class="legend"><span><i class="dot" style="background:var(--gold)"></i>${t("legendPo")}</span><span><i class="dot" style="background:var(--loss)"></i>${t("legendRel")}</span></div><div class="table-scroll"><table class="standings"><thead><tr><th>#</th><th>${t("thTeam")}</th><th>${t("thM")}</th><th>${t("thPts")}</th><th>${t("thWL")}</th><th>${t("thSets")}</th><th>S-ratio</th><th>P-ratio</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function renderScorers() {
  const wrap = document.getElementById("scorers-wrap");
  if (!wrap) return;
  if (!SCORERS) { wrap.innerHTML = `<p class='muted'>${t("noData")}</p>`; return; }
  const players = (SCORERS.players || []).slice().sort((a, b) => b.pts - a.pts || b.avg - a.avg);
  const note = pick(SCORERS, "note", "noteEn", "noteTr") || t("scorersEmpty");
  if (!players.length) { wrap.innerHTML = `<div class="note">${note}</div>`; return; }
  const body = players.map((p, i) => {
    const avg = p.sets ? (p.pts / p.sets).toFixed(2) : (p.avg || "\u2014");
    return `<tr><td class="pos">${i + 1}</td><td class="team">${p.name}</td><td>${p.team}</td><td>${p.pos || ""}</td><td>${p.matches || 0}</td><td><strong>${p.pts}</strong></td><td>${avg}</td><td>${p.attack ?? "\u2014"}</td><td>${p.block ?? "\u2014"}</td><td>${p.ace ?? "\u2014"}</td></tr>`;
  }).join("");
  wrap.innerHTML = `<div class="table-scroll"><table class="standings"><thead><tr><th>#</th><th>${t("player")}</th><th>${t("club")}</th><th>${t("pos")}</th><th>${t("thM")}</th><th>${t("thPts")}</th><th>${t("avg")}</th><th>${t("attack")}</th><th>${t("block")}</th><th>${t("ace")}</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function renderRound(roundObj) {
  if (!roundObj) return `<p class='muted'>${t("noData")}</p>`;
  return (roundObj.matches || []).map((m) => {
    const score = m.score ? `${m.score[0]}:${m.score[1]}` : "\u2013 : \u2013";
    const headline = pick(m.preview || {}, "headline", "headlineEn", "headlineTr") || t("match");
    const text = pick(m.preview || {}, "text", "textEn", "textTr");
    const keysArr = LANG === "tr" && m.preview?.keysTr ? m.preview.keysTr : (LANG === "en" && m.preview?.keysEn ? m.preview.keysEn : (m.preview?.keys || []));
    const predRaw = m.preview?.prediction;
    const pred = predRaw && predRaw !== "\u2014" ? `<div class="pred">${t("pred")}: ${predRaw} \u00b7 ${confLabel(m.preview.confidence)}</div>` : "";
    const keys = keysArr.map((k) => `<span>${k}</span>`).join("");
    const body = m.preview ? `<div class="preview-body">${text || ""}</div>${keys ? `<div class="keys">${keys}</div>` : ""}` : "";
    const tv = typeof tvLine === "function" ? tvLine(m) : "";
    const clip = clipBtn(m.clip);
    return `<article class="card"><div class="muted">${m.date || ""} ${m.time || ""} \u00b7 ${m.venue || ""}</div><div class="match"><div class="side">${teamName(m.home)}</div><div class="mid"><strong>${score}</strong></div><div class="side away">${teamName(m.away)}</div></div>${tv}${clip}<h3>${headline}</h3>${pred}${body}</article>`;
  }).join("");
}
function renderNews() {
  return (NEWS.items || []).map((n) => {
    const title = pick(n, "t", "te", "tt");
    const body = pick(n, "b", "be", "bt");
    const clip = clipBtn(n.clip, n.clipL);
    return `<details class="card news-card"><summary><div class="muted">${n.d}</div><div class="news-head"><p>${title}</p><span class="chev">›</span></div></summary>${body ? `<div class="news-body">${body}${clip}</div>` : clip}</details>`;
  }).join("");
}
function fillResultSelect() {
  const sel = document.getElementById("match-select");
  if (!sel || !MATCHES) return;
  const prefix = LANG === "pl" ? "K" : (LANG === "tr" ? "H" : "R");
  const opts = [];
  MATCHES.rounds.forEach((r) => r.matches.forEach((m) => opts.push(`<option value="${m.id}">${prefix}${r.round}: ${teamShort(m.home)} \u2013 ${teamShort(m.away)}</option>`)));
  const prev = sel.value;
  sel.innerHTML = opts.join("");
  if (prev) sel.value = prev;
}
function persistResults() { localStorage.setItem("tlk-results", JSON.stringify(MATCHES)); }
function loadResults() {
  try {
    const raw = localStorage.getItem("tlk-results");
    if (!raw) return;
    const saved = JSON.parse(raw);
    const byId = {};
    saved.rounds.forEach((r) => r.matches.forEach((m) => { byId[m.id] = m; }));
    MATCHES.rounds.forEach((r) => r.matches.forEach((m) => {
      const s = byId[m.id];
      if (s && s.score) { m.score = s.score; m.sets = s.sets; }
      if (s && s.clip) m.clip = s.clip;
    }));
  } catch (e) {}
}
function applyResult() {
  const id = document.getElementById("match-select").value;
  const hs = +document.getElementById("home-sets").value;
  const as = +document.getElementById("away-sets").value;
  const raw = document.getElementById("set-points").value.trim();
  if (![3,2,1,0].includes(hs) || ![3,2,1,0].includes(as) || hs === as || Math.max(hs, as) !== 3) { alert(t("alertScore")); return; }
  const parts = raw.split(/[,\s]+/).filter(Boolean);
  const sets = parts.map((p) => p.split(/[-:]/).map(Number));
  if (sets.length !== hs + as || sets.some((s) => s.length !== 2 || Number.isNaN(s[0]))) { alert(t("alertSets")); return; }
  MATCHES.rounds.forEach((r) => r.matches.forEach((m) => {
    if (m.id === id) { m.score = [hs, as]; m.sets = sets; }
  }));
  persistResults(); refresh();
  if (typeof trackUse === "function") trackUse();
  alert(t("alertSaved"));
}
function refresh() {
  applyI18n();
  renderTable(computeTable(SEASON.teams, MATCHES.rounds));
  renderScorers();
  document.getElementById("round1").innerHTML = renderRound(MATCHES.rounds.find((r) => r.round === 1));
  document.getElementById("round2").innerHTML = renderRound(MATCHES.rounds.find((r) => r.round === 2));
  document.getElementById("news").innerHTML = renderNews();
  if (typeof renderAnalysis === "function") renderAnalysis();
  fillResultSelect();
  const inj = (SEASON.injuries || []).map((i) => `<div class="card"><strong>${i.player}</strong> \u00b7 ${i.team}<p>${pick(i, "note", "noteEn", "noteTr")}</p><div class="muted">${t("updatedShort")} ${i.updated}</div></div>`).join("") || `<p class='muted'>${t("noInj")}</p>`;
  document.getElementById("injuries").innerHTML = inj;
}
function show(tab) {
  document.querySelectorAll("section").forEach((s) => s.classList.toggle("active", s.id === tab));
  document.querySelectorAll("nav.tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
}
async function init() {
  LANG = detectLang();
  const bust = { cache: "no-store" };
  const [s, m, sc, nw, an] = await Promise.all([
    fetch("./data/season.json?v=20", bust).then((r) => r.json()),
    fetch("./data/matches.json?v=20", bust).then((r) => r.json()),
    fetch("./data/scorers.json?v=20", bust).then((r) => r.json()).catch(() => ({ updated: "\u2014", players: [] })),
    fetch("./data/news.json?v=20", bust).then((r) => r.json()).catch(() => ({ items: [] })),
    fetch("./data/analysis.json?v=20", bust).then((r) => r.json()).catch(() => ({ charts: [], legend: [] }))
  ]);
  SEASON = s; MATCHES = m; SCORERS = sc; NEWS = nw;
  if (typeof ANALYSIS !== "undefined") ANALYSIS = an; else window.ANALYSIS = an;
  s.teams.forEach((x) => { TEAM[x.id] = x; });
  loadResults();
  document.getElementById("save-btn").addEventListener("click", applyResult);
  document.getElementById("reset-btn").addEventListener("click", () => { localStorage.removeItem("tlk-results"); location.reload(); });
  document.querySelectorAll("nav.tabs button").forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));
  document.querySelectorAll(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));
  refresh();
  if (typeof trackVisit === "function") trackVisit();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.update()));
    navigator.serviceWorker.register("./sw.js?v=20");
  }
}
init().catch((e) => { document.getElementById("table-wrap").innerHTML = "<p>" + t("loadErr") + e.message + "</p>"; });
