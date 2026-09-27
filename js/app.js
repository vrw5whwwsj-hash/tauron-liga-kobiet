const TEAM = {};
let SEASON = null;
let MATCHES = null;
let SCORERS = null;
const emptyStats = () => ({ played: 0, pts: 0, w: 0, l: 0, sw: 0, sl: 0, pw: 0, pl: 0 });
function setRatio(a, b) { if (!b && !a) return 0; if (!b) return a > 0 ? 999 : 0; return a / b; }
function computeTable(teams, rounds) {
  const map = {};
  teams.forEach((t) => { map[t.id] = { ...t, ...emptyStats() }; });
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
    return a.name.localeCompare(b.name, "pl");
  });
  return rows;
}
function fmtRatio(a, b) { if (!a && !b) return "—"; return setRatio(a, b).toFixed(3); }
function teamName(id) { return TEAM[id]?.name || id; }
function teamShort(id) { return TEAM[id]?.short || id; }
function renderTable(rows) {
  const body = rows.map((t, i) => {
    const cls = i < 8 ? "po" : i === 11 ? "rel" : "";
    return `<tr class="${cls}"><td class="pos">${i + 1}</td><td class="team">${t.name}</td><td>${t.played}</td><td><strong>${t.pts}</strong></td><td>${t.w}-${t.l}</td><td>${t.sw}:${t.sl}</td><td>${fmtRatio(t.sw, t.sl)}</td><td>${fmtRatio(t.pw, t.pl)}</td></tr>`;
  }).join("");
  document.getElementById("table-wrap").innerHTML = `<div class="legend"><span><i class="dot" style="background:var(--gold)"></i>play-off (1–8)</span><span><i class="dot" style="background:var(--loss)"></i>strefa spadkowa (12)</span></div><div style="overflow-x:auto"><table class="standings"><thead><tr><th>#</th><th>Drużyna</th><th>M</th><th>Pkt</th><th>W-P</th><th>Sety</th><th>S-ratio</th><th>P-ratio</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function renderScorers() {
  const wrap = document.getElementById("scorers-wrap");
  if (!SCORERS) { wrap.innerHTML = "<p class='muted'>Brak danych.</p>"; return; }
  const players = (SCORERS.players || []).slice().sort((a, b) => b.pts - a.pts || b.avg - a.avg);
  if (!players.length) {
    wrap.innerHTML = `<div class="note">${SCORERS.note || "Ranking pojawi się po 1. kolejce."}</div><div class="card"><p class="muted">Aktualizacja: ${SCORERS.updated}. Źródło: ${SCORERS.source}.</p></div>`;
    return;
  }
  const body = players.map((p, i) => {
    const avg = p.sets ? (p.pts / p.sets).toFixed(2) : (p.avg || "—");
    return `<tr><td class="pos">${i + 1}</td><td class="team">${p.name}</td><td>${p.team}</td><td>${p.pos || ""}</td><td>${p.matches || 0}</td><td><strong>${p.pts}</strong></td><td>${avg}</td><td>${p.attack ?? "—"}</td><td>${p.block ?? "—"}</td><td>${p.ace ?? "—"}</td></tr>`;
  }).join("");
  wrap.innerHTML = `<div class="note">Akt. ${SCORERS.updated} · ${SCORERS.phase}. Źródło: ${SCORERS.source}</div><div style="overflow-x:auto"><table class="standings"><thead><tr><th>#</th><th>Zawodniczka</th><th>Klub</th><th>Poz.</th><th>M</th><th>Pkt</th><th>Śr./set</th><th>Atak</th><th>Blok</th><th>As</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function renderRound(roundObj) {
  if (!roundObj) return "<p class='muted'>Brak danych.</p>";
  return (roundObj.matches || []).map((m) => {
    const score = m.score ? `${m.score[0]}:${m.score[1]}` : "– : –";
    const pred = m.preview?.prediction && m.preview.prediction !== "—" ? `<div class="pred">Prognoza: ${m.preview.prediction} · ${m.preview.confidence || ""}</div>` : "";
    const keys = (m.preview?.keys || []).map((k) => `<span>${k}</span>`).join("");
    const body = m.preview ? `<div class="preview-body">${m.preview.text || ""}</div>${keys ? `<div class="keys">${keys}</div>` : ""}` : "";
    return `<article class="card"><div class="muted">${m.date || ""} ${m.time || ""} · ${m.venue || ""}</div><div class="match"><div class="side">${teamName(m.home)}</div><div class="mid"><strong>${score}</strong></div><div class="side away">${teamName(m.away)}</div></div><h3>${m.preview?.headline || "Mecz"}</h3>${pred}${body}</article>`;
  }).join("");
}
function renderNews() {
  const items = [
    { d: "2026-09-26", t: "ŁKS najlepszy w Twardogórze; kontuzja Magdaleny Jurczyk" },
    { d: "2026-09-26", t: "PGE Budowlani lepsi od #VolleyWrocław w ostatnim sparingu" },
    { d: "2026-09-25", t: "LOTTO Chemik Police: duże zmiany i duże ambicje" },
    { d: "2026-09-25", t: "MOYA Radomka Radom — klub po letniej rewolucji" },
    { d: "2026-09-24", t: "Inauguracja sezonu 2026/27 w Kaliszu" },
    { d: "2026-09-24", t: "Trener Sokoła: chcemy być najwaleczniejsi w lidze" },
    { d: "2026-09-24", t: "Alicja Grabka nową kapitan DevelopResu" },
    { d: "2026-09-23", t: "Wzmocniony #VolleyWrocław patrzy w górę tabeli" }
  ];
  return items.map((n) => `<div class="card"><div class="muted">${n.d}</div><p>${n.t}</p></div>`).join("");
}
function fillResultSelect() {
  const sel = document.getElementById("match-select");
  const opts = [];
  MATCHES.rounds.forEach((r) => r.matches.forEach((m) => opts.push(`<option value="${m.id}">K${r.round}: ${teamShort(m.home)} – ${teamShort(m.away)}</option>`)));
  sel.innerHTML = opts.join("");
}
function persistResults() { localStorage.setItem("tlk-results", JSON.stringify(MATCHES)); }
function loadResults() {
  try {
    const raw = localStorage.getItem("tlk-results");
    if (!raw) return;
    const saved = JSON.parse(raw);
    const byId = {};
    saved.rounds.forEach((r) => r.matches.forEach((m) => { byId[m.id] = m; }));
    MATCHES.rounds.forEach((r) => r.matches.forEach((m) => { const s = byId[m.id]; if (s && s.score) { m.score = s.score; m.sets = s.sets; } }));
  } catch (e) {}
}
function applyResult() {
  const id = document.getElementById("match-select").value;
  const hs = +document.getElementById("home-sets").value;
  const as = +document.getElementById("away-sets").value;
  const raw = document.getElementById("set-points").value.trim();
  if (![3,2,1,0].includes(hs) || ![3,2,1,0].includes(as) || hs === as || Math.max(hs, as) !== 3) { alert("Wynik setowy musi być 3:0, 3:1, 3:2 lub odwrotnie."); return; }
  const parts = raw.split(/[,\s]+/).filter(Boolean);
  const sets = parts.map((p) => p.split(/[-:]/).map(Number));
  if (sets.length !== hs + as || sets.some((s) => s.length !== 2 || Number.isNaN(s[0]))) { alert("Podaj małe punkty setów, np. 25-20,25-18,25-16"); return; }
  MATCHES.rounds.forEach((r) => r.matches.forEach((m) => { if (m.id === id) { m.score = [hs, as]; m.sets = sets; } }));
  persistResults(); refresh(); alert("Zapisano wynik. Tabela przeliczona wg regulaminu PLS.");
}
function refresh() {
  renderTable(computeTable(SEASON.teams, MATCHES.rounds));
  renderScorers();
  document.getElementById("round1").innerHTML = renderRound(MATCHES.rounds.find((r) => r.round === 1));
  document.getElementById("round2").innerHTML = renderRound(MATCHES.rounds.find((r) => r.round === 2));
  document.getElementById("news").innerHTML = renderNews();
  const inj = (SEASON.injuries || []).map((i) => `<div class="card"><strong>${i.player}</strong> · ${i.team}<p>${i.note}</p><div class="muted">akt. ${i.updated}</div></div>`).join("") || "<p class='muted'>Brak zgłoszonych absencji.</p>";
  document.getElementById("injuries").innerHTML = inj;
}
function show(tab) {
  document.querySelectorAll("section").forEach((s) => s.classList.toggle("active", s.id === tab));
  document.querySelectorAll("nav.tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
}
async function init() {
  const [s, m, sc] = await Promise.all([
    fetch("./data/season.json").then((r) => r.json()),
    fetch("./data/matches.json").then((r) => r.json()),
    fetch("./data/scorers.json").then((r) => r.json()).catch(() => ({ updated: "—", players: [] }))
  ]);
  SEASON = s; MATCHES = m; SCORERS = sc; s.teams.forEach((t) => { TEAM[t.id] = t; });
  loadResults(); fillResultSelect();
  document.getElementById("updated").textContent = "Stan na 27.09.2026 · sezon jeszcze nie wystartował";
  document.getElementById("save-btn").addEventListener("click", applyResult);
  document.getElementById("reset-btn").addEventListener("click", () => { localStorage.removeItem("tlk-results"); location.reload(); });
  document.querySelectorAll("nav.tabs button").forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));
  refresh();
  if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js");
}
init().catch((e) => { document.getElementById("table-wrap").innerHTML = "<p>Błąd wczytania danych: " + e.message + "</p>"; });
