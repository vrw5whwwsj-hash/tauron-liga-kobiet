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
function setLine(m) {
  if (!Array.isArray(m.sets) || !m.sets.length) return "";
  const line = m.sets.map((s, i) => `${i + 1}. ${s[0]}:${s[1]}`).join(" \u00b7 ");
  const lab = LANG === "en" ? "Sets" : LANG === "tr" ? "Setler" : "Sety";
  return `<div class="sets"><span class="muted">${lab}:</span> ${line}</div>`;
}
function confLabel(c) {
  if (LANG === "en") return ({ wysoka: "high", "\u015brednia": "medium", "\u015brednia+": "medium+", niska: "low" }[c]) || c || "";
  if (LANG === "tr") return ({ wysoka: "yüksek", "\u015brednia": "orta", "\u015brednia+": "orta+", niska: "düşük" }[c]) || c || "";
  return c || "";
}
function topList(arr) {
  if (!arr || !arr.length) return "";
  return arr.slice(0, 3).map((p) => `<li><strong>${p.n || p.name}</strong> \u00b7 ${p.p ?? p.pts} pkt</li>`).join("");
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
  const note = pick(SCORERS, "note", "noteEn", "noteTr") || t("scorersEmpty");
  const rankings = SCORERS.rankings || [];
  if (!rankings.length) {
    const players = (SCORERS.players || []).slice().sort((a, b) => b.pts - a.pts || b.avg - a.avg);
    if (!players.length) { wrap.innerHTML = `<div class="note">${note}</div>`; return; }
    const body = players.map((p, i) => {
      const avg = p.sets ? (p.pts / p.sets).toFixed(2) : (p.avg || "\u2014");
      return `<tr><td class="pos">${i + 1}</td><td class="team">${p.name}</td><td>${p.team}</td><td>${p.pos || ""}</td><td>${p.matches || 0}</td><td><strong>${p.pts}</strong></td><td>${avg}</td><td>${p.attack ?? "\u2014"}</td><td>${p.block ?? "\u2014"}</td><td>${p.ace ?? "\u2014"}</td></tr>`;
    }).join("");
    wrap.innerHTML = `<div class="table-scroll"><table class="standings"><thead><tr><th>#</th><th>${t("player")}</th><th>${t("club")}</th><th>${t("pos")}</th><th>${t("thM")}</th><th>${t("thPts")}</th><th>${t("avg")}</th><th>${t("attack")}</th><th>${t("block")}</th><th>${t("ace")}</th></tr></thead><tbody>${body}</tbody></table></div>`;
    return;
  }
  const setsLab = LANG === "en" ? "Sets" : LANG === "tr" ? "Set" : "Sety";
  const nLab = LANG === "en" ? "Recv" : LANG === "tr" ? "Karş." : "Liczba";
  const digLab = LANG === "en" ? "Digs" : LANG === "tr" ? "Savunma" : "Obrony";
  wrap.innerHTML = `<div class="note">${note}</div>` + rankings.map((r) => {
    const title = pick(r, "title", "titleEn", "titleTr");
    const kind = r.id;
    const head = kind === "block" ? ["#", t("player"), t("club"), t("thM"), setsLab, t("block"), t("avg")]
      : kind === "serve" ? ["#", t("player"), t("club"), t("thM"), setsLab, t("ace"), t("avg")]
      : kind === "attack" ? ["#", t("player"), t("club"), t("thM"), setsLab, t("attack"), "Eff%"]
      : kind === "receive" ? ["#", t("player"), t("club"), t("thM"), setsLab, nLab, "poz%", "perf%"]
      : kind === "dig" ? ["#", t("player"), t("club"), t("thM"), setsLab, digLab, t("avg")]
      : ["#", t("player"), t("club"), t("thM"), setsLab, t("thPts"), t("avg")];
    const body = (r.players || []).slice(0, 5).map((p) => {
      const cells = kind === "block" ? [p.rank, p.name, p.team, p.matches, p.sets, `<strong>${p.block}</strong>`, p.perSet]
        : kind === "serve" ? [p.rank, p.name, p.team, p.matches, p.sets, `<strong>${p.ace}</strong>`, p.perSet]
        : kind === "attack" ? [p.rank, p.name, p.team, p.matches, p.sets, `<strong>${p.attack}</strong>`, p.eff]
        : kind === "receive" ? [p.rank, p.name, p.team, p.matches, p.sets, p.n, `<strong>${p.posPct}</strong>`, p.perf]
        : kind === "dig" ? [p.rank, p.name, p.team, p.matches, p.sets, `<strong>${p.digs}</strong>`, p.perSet]
        : [p.rank, p.name, p.team, p.matches, p.sets, `<strong>${p.pts}</strong>`, p.perSet];
      return `<tr>${cells.map((c, i) => `<td class="${i === 0 ? "pos" : i === 1 ? "team" : ""}">${c}</td>`).join("")}</tr>`;
    }).join("");
    return `<div class="card"><h2>${title}</h2><div class="table-scroll"><table class="standings"><thead><tr>${head.map((h) => `<th>${h}</th>`).join("")}</tr></thead><tbody>${body}</tbody></table></div></div>`;
  }).join("");
}
function renderRound(roundObj) {
  if (!roundObj) return `<p class='muted'>${t("noData")}</p>`;
  return (roundObj.matches || []).map((m) => {
    const played = Array.isArray(m.score) && m.score.length === 2;
    const score = played ? `${m.score[0]}:${m.score[1]}` : "\u2013 : \u2013";
    const tv = typeof tvLine === "function" ? tvLine(m) : "";
    const when = [m.date || "", m.time || ""].filter(Boolean).join(" ");
    const rec = m.recap || {};
    const recText = pick(rec, "text", "textEn", "textTr");
    const homeTop = topList(rec.homeTop || rec.home);
    const awayTop = topList(rec.awayTop || rec.away);
    const tops = (homeTop || awayTop) ? `<div class="recap-tops"><div><div class="muted">${teamShort(m.home)}</div><ul>${homeTop}</ul></div><div><div class="muted">${teamShort(m.away)}</div><ul>${awayTop}</ul></div></div>` : "";
    const head = `<div class="muted">${when} \u00b7 ${m.venue || ""}</div><div class="match"><div class="side">${teamName(m.home)}</div><div class="mid"><strong>${score}</strong></div><div class="side away">${teamName(m.away)}</div></div>${setLine(m)}${tv}`;
    if (played) {
      const title = pick(rec, "title", "titleEn", "titleTr") || t("match");
      return `<article class="card">${head}${clipBtn(m.clip || rec.clip)}<h3>${title}</h3><div class="preview-body">${recText || ""}</div>${tops}</article>`;
    }
    const headline = pick(m.preview || {}, "headline", "headlineEn", "headlineTr") || t("match");
    const text = pick(m.preview || {}, "text", "textEn", "textTr");
    const keysArr = LANG === "tr" && m.preview?.keysTr ? m.preview.keysTr : (LANG === "en" && m.preview?.keysEn ? m.preview.keysEn : (m.preview?.keys || []));
    const predRaw = m.preview?.prediction;
    const pred = predRaw && predRaw !== "\u2014" ? `<div class="pred">${t("pred")}: ${predRaw} \u00b7 ${confLabel(m.preview.confidence)}</div>` : "";
    const keys = keysArr.map((k) => `<span>${k}</span>`).join("");
    const body = m.preview ? `<div class="preview-body">${text || ""}</div>${keys ? `<div class="keys">${keys}</div>` : ""}` : "";
    return `<article class="card">${head}${clipBtn(m.clip)}<h3>${headline}</h3>${pred}${body}</article>`;
  }).join("");
}
function newsSource(n) {
  if (!n.u) return "";
  const label = LANG === "tr" ? "Kaynak" : (LANG === "en" ? "Source" : "Źródło");
  const name = n.un || n.u;
  return `<p class="news-src"><a href="${n.u}" target="_blank" rel="noopener">${label}: ${name}</a></p>`;
}
function renderNews() {
  return (NEWS.items || []).map((n) => {
    const title = pick(n, "t", "te", "tt");
    const body = pick(n, "b", "be", "bt");
    const clip = clipBtn(n.clip, n.clipL);
    const src = newsSource(n);
    return `<details class="card news-card"><summary><div class="muted">${n.d}</div><div class="news-head"><p>${title}</p><span class="chev">\u203a</span></div></summary>${body ? `<div class="news-body">${body}${clip}${src}</div>` : `${clip}${src}`}</details>`;
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
      if (s && s.recap) m.recap = s.recap;
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
function paintRound(id, n) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = renderRound(MATCHES.rounds.find((r) => r.round === n));
}
function refresh() {
  applyI18n();
  renderTable(computeTable(SEASON.teams, MATCHES.rounds));
  renderScorers();
  paintRound("round1", 1);
  paintRound("round2", 2);
  paintRound("round3", 3);
  document.getElementById("news").innerHTML = renderNews();
  if (typeof renderAnalysis === "function") renderAnalysis();
  if (typeof renderCev === "function") renderCev();
  fillResultSelect();
  const inj = (SEASON.injuries || []).map((i) => `<div class="card"><strong>${i.player}</strong> \u00b7 ${i.team}<p>${pick(i, "note", "noteEn", "noteTr")}</p><div class="muted">${t("updatedShort")} ${i.updated}</div></div>`).join("") || `<p class='muted'>${t("noInj")}</p>`;
  document.getElementById("injuries").innerHTML = inj;
}
function show(tab) {
  document.querySelectorAll("section").forEach((s) => s.classList.toggle("active", s.id === tab));
  document.querySelectorAll("nav.tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
  if (tab === "sec-cev" && typeof renderCev === "function") renderCev();
}
async function init() {
  LANG = detectLang();
  const bust = { cache: "no-store" };
  const [s, m, sc, nw, an, r3, cev] = await Promise.all([
    fetch("./data/season.json?v=41", bust).then((r) => r.json()),
    fetch("./data/matches.json?v=41", bust).then((r) => r.json()),
    fetch("./data/scorers.json?v=41", bust).then((r) => r.json()).catch(() => ({ updated: "\u2014", players: [] })),
    fetch("./data/news.json?v=41", bust).then((r) => r.json()).catch(() => ({ items: [] })),
    fetch("./data/analysis.json?v=41", bust).then((r) => r.json()).catch(() => ({ charts: [], legend: [] })),
    fetch("./data/r3.json?v=41", bust).then((r) => r.json()).catch(() => null),
    fetch("./data/cev.json?v=41", bust).then((r) => r.json()).catch(() => null)
  ]);
  SEASON = s; MATCHES = m; SCORERS = sc; NEWS = nw;
  if (r3 && r3.round && !(m.rounds || []).some((x) => x.round === r3.round)) m.rounds.push(r3);
  if (typeof ANALYSIS !== "undefined") ANALYSIS = an; else window.ANALYSIS = an;
  if (cev) CEV = cev;
  s.teams.forEach((x) => { TEAM[x.id] = x; });
  loadResults();
  document.getElementById("save-btn").addEventListener("click", applyResult);
  document.getElementById("reset-btn").addEventListener("click", () => { localStorage.removeItem("tlk-results"); location.reload(); });
  document.querySelectorAll("nav.tabs button").forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));
  document.querySelectorAll(".lang button").forEach((b) => {
    if (b.classList.contains("cev-sub")) return;
    b.addEventListener("click", () => setLang(b.dataset.lang));
  });
  if (typeof cevBind === "function") cevBind();
  refresh();
  if (typeof trackVisit === "function") trackVisit();
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.update()));
    navigator.serviceWorker.register("./sw.js?v=41");
  }
}
init().catch((e) => { document.getElementById("table-wrap").innerHTML = "<p>" + t("loadErr") + e.message + "</p>"; });
