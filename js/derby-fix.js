(function () {
  var TITLE = "\u0141KS wygrywa derby 3:1, Jurczyk 11 pkt";
  var TEXT = "PGE Budowlani \u0141\u00f3d\u017a przegra\u0142y derby z \u0141KS Commercecon 1:3 (19:25, 18:25, 25:14, 18:25). Sport Arena, 3000 widz\u00f3w, mecz trwa\u0142 1:41, ma\u0142e punkty 80:89. \u0141KS wygra\u0142 dwa pierwsze sety, Budowlani odpowiedzia\u0142y 25:14 w trzecim, a czwart\u0105 parti\u0119 go\u015bcie zamkn\u0119\u0142y 25:18. To pierwsze zwyci\u0119stwo \u0141KS w sezonie po tie-breakowej pora\u017cce z DevelopResem. MVP: Magdalena Jurczyk (#95) \u2014 11 punkt\u00f3w, wychodzona na strefie 3 we wszystkich czterech setach. \u0141KS: Oleksandra Milenko 16, Suvi Kokkonen 14, Elles Dambrink 12, Magdalena Jurczyk 11, Anna Obia\u0142a 6, Sonia Stefanik 5, Regiane Bidias 3, Maja Szyma\u0144ska 1. Libero Anna Paw\u0142owska. Budowlani: Martyna Grajber-Nowakowska 11, Didona Iuna Catalina Zadorojnai 11, Sa\u0161a Planin\u0161ec 9, Rodica Buterez 7, Paulina Majkowska 7, Aleksandra Kaza\u0142a 6, Maja Storck 3.";
  function apply() {
    document.querySelectorAll("article.card").forEach(function (card) {
      var t = card.textContent || "";
      if (t.indexOf("Budowlani") === -1 || t.indexOf("\u0141KS") === -1) return;
      if (t.indexOf("1:3") === -1 && t.indexOf("19:25") === -1 && t.indexOf("nie by\u0142o") === -1) return;
      var h = card.querySelector("h3");
      if (h && (h.textContent.indexOf("derby") !== -1 || h.textContent.indexOf("Derby") !== -1 || h.textContent.indexOf("\u0141KS wygrywa") !== -1)) h.textContent = TITLE;
      var body = card.querySelector(".preview-body");
      if (body && (body.textContent.indexOf("Jurczyk") !== -1 || body.textContent.indexOf("19:25") !== -1)) body.textContent = TEXT;
      card.querySelectorAll(".recap-tops ul").forEach(function (ul) {
        if (ul.textContent.indexOf("Dambrink") === -1 || ul.textContent.indexOf("Jurczyk") !== -1) return;
        var li = document.createElement("li");
        li.innerHTML = "<strong>Magdalena Jurczyk</strong> \u00b7 11 pkt";
        ul.appendChild(li);
      });
    });
  }
  setTimeout(apply, 400);
  setTimeout(apply, 1400);
})();
