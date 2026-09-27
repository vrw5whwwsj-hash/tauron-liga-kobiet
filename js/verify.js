const OFFICIAL = {
  pls: "https://www.tauronligakobiet.pl",
  polsat: "https://www.polsatsport.pl/siatkowka/"
};
function emptyVerify() {
  return { status: "pending", pls: false, polsat: false, savedAt: new Date().toISOString() };
}
function isVerified(m) {
  return !!(m && m.verify && m.verify.pls && m.verify.polsat);
}
function listedResults() {
  const out = [];
  if (!MATCHES) return out;
  MATCHES.rounds.forEach((r) => (r.matches || []).forEach((m) => {
    if (m.score) out.push({ round: r.round, match: m });
  }));
  return out;
}
function renderVerify() {
  const el = document.getElementById("verify-list");
  if (!el) return;
  const rows = listedResults();
  if (!rows.length) {
    el.innerHTML = `<p class="muted">${t("verifyEmpty")}</p>`;
    return;
  }
  el.innerHTML = rows.map(({ round, match: m }) => {
    const ok = isVerified(m);
    const score = `${m.score[0]}:${m.score[1]}`;
    const st = ok ? t("verifyOk") : t("verifyPending");
    const cls = ok ? "ok" : "wait";
    return `<article class="card verify-card ${cls}">
      <div class="muted">K${round} · ${m.date || ""}</div>
      <p><strong>${teamShort(m.home)} ${score} ${teamShort(m.away)}</strong></p>
      <p class="muted">${st}</p>
      <div class="verify-actions">
        <a class="ghost-link" href="${OFFICIAL.pls}" target="_blank" rel="noopener">TAURON Liga Kobiet</a>
        <a class="ghost-link" href="${OFFICIAL.polsat}" target="_blank" rel="noopener">Polsat Sport</a>
        <button type="button" data-verify="pls" data-id="${m.id}" class="${m.verify?.pls ? "on" : ""}">${t("verifyPls")}</button>
        <button type="button" data-verify="polsat" data-id="${m.id}" class="${m.verify?.polsat ? "on" : ""}">${t("verifyPolsat")}</button>
      </div>
    </article>`;
  }).join("");
  el.querySelectorAll("button[data-verify]").forEach((b) => {
    b.addEventListener("click", () => markVerified(b.dataset.id, b.dataset.verify));
  });
}
function markVerified(id, source) {
  MATCHES.rounds.forEach((r) => r.matches.forEach((m) => {
    if (m.id !== id) return;
    if (!m.verify) m.verify = emptyVerify();
    m.verify[source] = !m.verify[source];
    m.verify.status = (m.verify.pls && m.verify.polsat) ? "confirmed" : "pending";
    m.verify.checkedAt = new Date().toISOString();
  }));
  persistResults();
  renderVerify();
  refresh();
}
