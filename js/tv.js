const TV_MAP = {
  r1m1: "Polsat Sport 1",
  r1m2: "Polsat Sport 3",
  r1m3: "Polsat Sport 1",
  r1m4: "Polsat Sport 1",
  r1m5: "Polsat Sport 1",
  r1m6: "Polsat Sport 1",
  r2m1: "Polsat Sport 1",
  r2m2: "Polsat Sport 1",
  r2m3: "Polsat Sport 3",
  r2m4: "Polsat Sport 1",
  r2m5: "Polsat Sport 1",
  r2m6: "Polsat Sport 1",
  r3m1: "Polsat Sport 2",
  r3m2: "Polsat Sport Extra 3",
  r3m3: "Polsat Sport 1",
  r3m4: "Polsat Sport 1",
  r3m5: "Polsat Sport 1",
  r3m6: "Polsat Sport 1",
  r4m1: "Polsat Sport 1",
  r4m2: "Polsat Sport 1",
  r4m3: "Polsat Sport 1",
  r4m4: "Polsat Sport 1",
  r4m5: "Polsat Sport 1",
  r4m6: "Polsat Sport Extra 3",
  r5m1: "Polsat Sport 3",
  r5m2: "Polsat Sport 1",
  r5m3: "Polsat Sport 1",
  r5m5: "Polsat Sport 1",
  r5m6: "Polsat Sport 1",
  r6m1: "Polsat Sport 2",
  r6m2: "Polsat Sport 1",
  r6m3: "Polsat Sport 1"
};
function tvLine(m) {
  const ch = (m && (m.tv || TV_MAP[m.id])) || "";
  if (!ch) return "";
  const label = typeof t === "function" ? t("tv") : "TV";
  return `<div class=\"pred\">${label}: ${ch}</div>`;
}
I18N.pl.tv = "TV";
I18N.en.tv = "TV";
I18N.tr.tv = "TV";
