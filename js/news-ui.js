function renderNews() {
  return (NEWS.items || []).map((n) => {
    const title = pick(n, "t", "te", "tt");
    const body = pick(n, "b", "be", "bt");
    return `<article class="card news-card"><div class="muted">${n.d}</div><div class="news-head"><p>${title}</p><span class="chev">›</span></div>${body ? `<div class="news-body">${body}</div>` : ""}</article>`;
  }).join("");
}
document.addEventListener("click", (e) => {
  const card = e.target.closest(".news-card");
  if (!card) return;
  card.classList.toggle("open");
});
