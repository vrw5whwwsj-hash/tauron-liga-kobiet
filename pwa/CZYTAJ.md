# TAURON Liga Kobiet 2026/27 — aplikacja na iPhone’a

To jest aplikacja webowa (PWA). Na iOS nie da się legalnie zainstalować pliku IPA bez konta Apple Developer i podpisu. PWA dodana do ekranu początkowego działa jak aplikacja: pełny ekran, ikona, dane lokalne, tryb offline.

## Instalacja na iPhonie

1. Wgraj cały folder `tauron-liga-pwa` na hosting z HTTPS (iCloud Drive / Pages, Netlify, GitHub Pages, własny serwer).
2. Otwórz `index.html` w Safari (nie w Chrome — iOS instaluje PWA tylko z Safari).
3. Stuknij Udostępnij → Dodaj do ekranu początkowego.
4. Ikona „TLK 26/27” pojawi się na pulpicie.

Service worker cache’uje stronę po pierwszym wejściu online.

## Co jest w środku

- Tabela liczona według punktacji TAURON Ligi Kobiet 2026/27: 3 / 2 / 1 / 0 oraz tie-breakery (zwycięstwa, stosunek setów, stosunek małych punktów).
- Wyniki 1. kolejki do 3 października oraz terminarz 2. i 3. kolejki.
- Relacje, absencje (Wieczorek, Gryka) i zapowiedzi z prognozą przed 2. kolejką.
- Ręczne dopisywanie setów — tabela przelicza się od razu i zostaje w telefonie.
- Eksport / import JSON, notatki klubowe.

Dane startowe: 4 października 2026, godz. 12:15. Mecze Wrocław–Stal (15:00) i ŁKS–DevelopRes (18:00) nie były jeszcze rozegrane.
