(function () {
  var TEXT = "PGE Budowlani \u0141\u00f3d\u017a \u2013 \u0141KS Commercecon 1:3 (19:25, 18:25, 25:14, 18:25). Sport Arena, 3000 widz\u00f3w, 1:41, ma\u0142e punkty 80:89. MVP Magdalena Jurczyk (#95). Protok\u00f3\u0142 VolleyStation: Jurczyk 11 punkt\u00f3w, wychodzona na strefie 3 we wszystkich czterech setach (3\u20133\u20133\u20133). Dalej Milenko 16, Kokkonen 14, Dambrink 12, Obia\u0142a 6, Stefanik 5, Bidias 3, Szyma\u0144ska 1. Nowakowska, Staniaszek, Sobalska i Miko\u0142ajewska bez punkt\u00f3w; libero Paw\u0142owska. Budowlani: Grajber-Nowakowska 11, Zadorojnai 11, Planin\u0161ec 9, Buterez 7, Majkowska 7, Kaza\u0142a 6, Storck 3.";
  function apply() {
    document.querySelectorAll(".preview-body").forEach(function (el) {
      if (el.textContent.indexOf("Jurczyk") !== -1 && (el.textContent.indexOf("nie by\u0142o") !== -1 || el.textContent.indexOf("not published") !== -1)) {
        el.textContent = TEXT;
      }
    });
    document.querySelectorAll(".recap-tops ul").forEach(function (ul) {
      if (ul.textContent.indexOf("Dambrink") === -1 || ul.textContent.indexOf("Jurczyk") !== -1) return;
      var li = document.createElement("li");
      li.innerHTML = "<strong>Magdalena Jurczyk</strong> \u00b7 11 pkt";
      ul.appendChild(li);
    });
  }
  setTimeout(apply, 500);
  setTimeout(apply, 1600);
})();
