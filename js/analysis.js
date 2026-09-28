let ANALYSIS = { charts: [], legend: [], notes: [] };
if (typeof I18N !== "undefined") {
  I18N.pl.tabAnalysis = "Analizy";
  I18N.pl.analysisH2 = "Analizy i technikalia";
  I18N.pl.analysisP = "Oparte o wpisy @PatrykWGesicki.";
  I18N.pl.analysisSrc = "Źródło analiz";
  I18N.pl.analysisBase = "Punkt odniesienia 2025/26";
  I18N.pl.analysisLive = "Sezon 2026/27";
  I18N.en.tabAnalysis = "Analysis";
  I18N.en.analysisH2 = "Analysis and technicals";
  I18N.en.analysisP = "Based on posts by @PatrykWGesicki.";
  I18N.en.analysisSrc = "Analysis source";
  I18N.en.analysisBase = "2025/26 baseline";
  I18N.en.analysisLive = "2026/27 season";
  I18N.tr.tabAnalysis = "Analiz";
  I18N.tr.analysisH2 = "Analiz ve teknikler";
  I18N.tr.analysisP = "@PatrykWGesicki paylaşımlarına dayanır.";
  I18N.tr.analysisSrc = "Kaynak";
  I18N.tr.analysisBase = "2025/26 referans";
  I18N.tr.analysisLive = "2026/27 sezonu";
}
function barChart(ch) {
  const title = pick(ch, "title", "titleEn", "titleTr");
  const note = pick(ch, "note", "noteEn", "noteTr");
  const max = ch.max || 100;
  const rows = (ch.rows || []).map((r) => {
    const pct = Math.max(4, Math.min(100, (r.v / max) * 100));
    return `<div class="bar-row"><div class="bar-lab"><span>${r.name} <small>${r.team || ""}</small></span><strong>${r.v}${ch.unit || ""}</strong></div><div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${ch.color || "#e8b84a"}"></div></div></div>`;
  }).join("");
  return `<div class="card"><h3>${title}</h3><p class="muted">${note || ""}</p>${rows}</div>`;
}
function renderAnalysis() {
  const box = document.getElementById("analysis-wrap");
  if (!box) return;
  const src = ANALYSIS.source || {};
  const liveNote = pick(ANALYSIS, "seasonLiveNote", "seasonLiveNoteEn", "seasonLiveNoteTr");
  const legend = (ANALYSIS.legend || []).map((x) => `<span class="chip"><b>${x.k}</b> ${pick(x, "pl", "en", "tr")}</span>`).join("");
  const charts = (ANALYSIS.charts || []).map(barChart).join("");
  const notes = (ANALYSIS.notes || []).map((n) => `<details class="card news-card"><summary><div class="muted">${n.d || ""}</div><div class="news-head"><p>${pick(n, "t", "te", "tt")}</p><span class="chev">›</span></div></summary><div class="news-body">${pick(n, "b", "be", "bt")}</div></details>`).join("");
  box.innerHTML = `<div class="card src-card"><h2 data-keep="1">${t("analysisSrc")}</h2><p>${src.name || "Patryk Wojciech Gęsicki"}</p><a class="src-handle" href="${src.url || "https://x.com/PatrykWGesicki"}" target="_blank" rel="noopener">${src.handle || "@PatrykWGesicki"}</a><div class="chip-row">${legend}</div></div><div class="note">${liveNote || ""}</div><h2 style="font-size:14px;margin:12px 4px 8px">${t("analysisBase")}</h2>${charts}${notes}`;
}
