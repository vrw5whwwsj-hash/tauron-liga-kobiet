let CEV = null;
function cevPairs(ids) {
  const out = [];
  for (let i = 0; i < ids.length; i++) {
    for (let j = 0; j < ids.length; j++) {
      if (i === j) continue;
      out.push({ id: ids[i] + "-" + ids[j], home: ids[i], away: ids[j] });
    }
  }
  return out;
}
function cevLoad() {
  try { return JSON.parse(localStorage.getItem("tlk-cev") || "{}"); } catch (e) { return {}; }
}
function cevSave(map) { localStorage.setItem("tlk-cev", JSON.stringify(map)); }
function cevEmpty() { return { played: 0, w: 0, l: 0, pts: 0, sw: 0, sl: 0, pw: 0, pl: 0 }; }
function cevTable(g) {
  const map = {};
  g.teams.forEach((id) => { map[id] = { id, ...(CEV.teams[id] || { name: id, short: id }), ...cevEmpty() }; });
  const saved = cevLoad();
  cevPairs(g.teams).forEach((m) => {
    const r = saved[m.id];
    if (!r || !r.score || !r.sets) return;
    const H = map[m.home], A = map[m.away];
    if (!H || !A) return;
    const hs = r.score[0], as = r.score[1];
    H.played++; A.played++;
    H.sw += hs; H.sl += as; A.sw += as; A.sl += hs;
    r.sets.forEach(([hp, ap]) => { H.pw += hp; H.pl += ap; A.pw += ap; A.pl += hp; });
    if (hs > as) { H.w++; A.l++; } else { A.w++; H.l++; }
    H.pts += hs === 3 && as <= 1 ? 3 : hs === 3 ? 2 : as === 3 && hs === 2 ? 1 : 0;
    A.pts += as === 3 && hs <= 1 ? 3 : as === 3 ? 2 : hs === 3 && as === 2 ? 1 : 0;
  });
  const rows = Object.values(map);
  const ratio = (a, b) => (!b && !a) ? 0 : (!b ? 999 : a / b);
  rows.sort((a, b) => {
    if (b.w !== a.w) return b.w - a.w;
    if (b.pts !== a.pts) return b.pts - a.pts;
    const sr = ratio(b.sw, b.sl) - ratio(a.sw, a.sl);
    if (sr) return sr;
    const pr = ratio(b.pw, b.pl) - ratio(a.pw, a.pl);
    if (pr) return pr;
    return (a.short || "").localeCompare(b.short || "", "pl");
  });
  return rows;
}
function cevFmt(a, b) { if (!a && !b) return "—"; return (b ? a / b : a).toFixed(3); }
function renderCevGroup(gid) {
  if (!CEV) return;
  const g = CEV.groups.find((x) => x.id === gid);
  if (!g) return;
  const saved = cevLoad();
  const rows = cevTable(g);
  const body = rows.map((x, i) => {
    const cls = i === 0 ? "po" : i === 1 ? "" : "";
    return `<tr class="${cls}"><td class="pos">${i + 1}</td><td class="team">${x.short} <span class="muted">${x.cc || ""}</span></td><td>${x.played}</td><td>${x.w}-${x.l}</td><td><strong>${x.pts}</strong></td><td>${x.sw}:${x.sl}</td><td>${cevFmt(x.sw, x.sl)}</td><td>${cevFmt(x.pw, x.pl)}</td></tr>`;
  }).join("");
  const tbl = document.getElementById("cev-table");
  if (tbl) tbl.innerHTML = `<div class="table-scroll"><table class="standings"><thead><tr><th>#</th><th>Zespół</th><th>M</th><th>W-P</th><th>Pkt</th><th>Sety</th><th>S-r</th><th>P-r</th></tr></thead><tbody>${body}</tbody></table></div>`;
  const list = document.getElementById("cev-matches");
  if (list) {
    list.innerHTML = cevPairs(g.teams).map((m) => {
      const r = saved[m.id];
      const sc = r && r.score ? r.score[0] + ":" + r.score[1] : "– : –";
      const st = r && r.sets ? r.sets.map((s) => s[0] + ":" + s[1]).join(" · ") : "";
      const hn = CEV.teams[m.home]?.short || m.home;
      const an = CEV.teams[m.away]?.short || m.away;
      return `<article class="card"><div class="match"><div class="side">${hn}</div><div class="mid"><strong>${sc}</strong></div><div class="side away">${an}</div></div>${st ? `<div class="muted sets">Sety: ${st}</div>` : ""}<button type="button" class="ghost cev-pick" data-id="${m.id}">${LANG === "en" ? "Enter score" : "Wpisz wynik"}</button></article>`;
    }).join("");
    list.querySelectorAll(".cev-pick").forEach((b) => b.addEventListener("click", () => {
      const sel = document.getElementById("cev-match-select");
      if (sel) sel.value = b.dataset.id;
      document.getElementById("sec-cev")?.scrollIntoView({ behavior: "smooth", block: "end" });
    }));
  }
  const sel = document.getElementById("cev-match-select");
  if (sel) {
    sel.innerHTML = cevPairs(g.teams).map((m) => {
      const hn = CEV.teams[m.home]?.short || m.home;
      const an = CEV.teams[m.away]?.short || m.away;
      return `<option value="${m.id}">${hn} – ${an}</option>`;
    }).join("");
  }
}
function renderCev() {
  if (!CEV) return;
  const active = document.querySelector(".cev-sub.active")?.dataset.g || "A";
  renderCevGroup(active);
}
function cevApply() {
  const id = document.getElementById("cev-match-select")?.value;
  if (!id) return;
  const hs = +document.getElementById("cev-home-sets").value;
  const as = +document.getElementById("cev-away-sets").value;
  const raw = (document.getElementById("cev-set-points").value || "").trim();
  if (![3, 2, 1, 0].includes(hs) || ![3, 2, 1, 0].includes(as) || hs === as || Math.max(hs, as) !== 3) {
    alert(t("alertScore")); return;
  }
  const sets = raw.split(/[,\s]+/).filter(Boolean).map((p) => p.split(/[-:]/).map(Number));
  if (sets.length !== hs + as || sets.some((s) => s.length !== 2 || Number.isNaN(s[0]))) {
    alert(t("alertSets")); return;
  }
  const map = cevLoad();
  map[id] = { score: [hs, as], sets };
  cevSave(map);
  renderCev();
  alert(t("alertSaved"));
}
function cevBind() {
  document.querySelectorAll(".cev-sub").forEach((b) => b.addEventListener("click", () => {
    document.querySelectorAll(".cev-sub").forEach((x) => x.classList.toggle("active", x === b));
    renderCevGroup(b.dataset.g);
  }));
  document.getElementById("cev-save")?.addEventListener("click", cevApply);
  document.getElementById("cev-reset")?.addEventListener("click", () => {
    localStorage.removeItem("tlk-cev");
    renderCev();
  });
}
