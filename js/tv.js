const TV_MAP = {
  r1m1: "Polsat Sport 1",
  r1m2: "Polsat Sport 3",
  r1m3: "Polsat Sport 1",
  r1m4: "Polsat Sport 1",
  r1m5: "Polsat Sport 1",
  r1m6: "Polsat Sport 1",
  r2m1: "Polsat Sport 1",
  r2m2: "Polsat Sport 1"
};
function tvLine(m) {
  const ch = (m && (m.tv || TV_MAP[m.id])) || "";
  if (!ch) return "";
  const label = typeof t === "function" ? t("tv") : "TV";
  return `<div class="pred">${label}: ${ch}</div>`;
}
I18N.pl.tv = "TV";
I18N.en.tv = "TV";
I18N.tr.tv = "TV";
