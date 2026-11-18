#!/usr/bin/env python3
"""
Pobiera rankingi indywidualne z tauronligakobiet.pl i zapisuje do data/scorers.json.
Uruchamiane przez GitHub Action.
"""
import json
import re
from datetime import date
from pathlib import Path

import requests
from bs4 import BeautifulSoup

URL = "https://www.tauronligakobiet.pl/statsRanking.html"
HEADERS = {"User-Agent": "VolleyNews-Updater/1.0 (https://zligowychhal.pl)"}

RANKINGS_META = [
    {"id": "mvp", "title": "MVP", "titleEn": "MVP", "titleTr": "MVP", "selector": "Ranking MVP"},
    {"id": "points", "title": "Punkty", "titleEn": "Points", "titleTr": "Sayı", "selector": "Ranking punktujących"},
    {"id": "attack", "title": "Atak", "titleEn": "Attack", "titleTr": "Hücum", "selector": "Ranking atakujących"},
    {"id": "block", "title": "Blok", "titleEn": "Block", "titleTr": "Blok", "selector": "Ranking blokujących"},
    {"id": "serve", "title": "Zagrywka", "titleEn": "Serve", "titleTr": "Servis", "selector": "Ranking zagrywających"},
    {"id": "receive", "title": "Przyjecie", "titleEn": "Reception", "titleTr": "Karşılama", "selector": "Ranking przyjmujących"},
    {"id": "dig", "title": "Obrona", "titleEn": "Dig", "titleTr": "Savunma", "selector": "Ranking broniących"},
]

def clean(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()

def parse_table(table):
    rows = []
    for tr in table.select("tr")[1:]:  # skip header
        cells = [clean(td.get_text()) for td in tr.select("td")]
        if len(cells) < 3:
            continue
        rank = cells[0]
        name = cells[2] if len(cells) > 2 else ""
        if not name or name == "----":
            continue
        rows.append({"rank": rank, "name": name, "cells": cells})
    return rows[:5]  # top 5

def extract_rankings(soup):
    rankings = []
    for meta in RANKINGS_META:
        heading = soup.find(string=re.compile(meta["selector"], re.I))
        if not heading:
            print(f"WARNING: nie znaleziono sekcji {meta['selector']}")
            continue
        table = heading.find_next("table")
        if not table:
            continue
        players_raw = parse_table(table)
        players = []
        for p in players_raw:
            c = p["cells"]
            entry = {"rank": p["rank"], "name": p["name"], "team": ""}
            if meta["id"] == "mvp":
                entry["mvp"] = int(c[-1]) if c[-1].isdigit() else 0
                entry["pts"] = entry["mvp"]
            elif meta["id"] == "points":
                entry.update({
                    "matches": int(c[3]) if len(c) > 3 and c[3].isdigit() else 0,
                    "sets": int(c[4]) if len(c) > 4 and c[4].isdigit() else 0,
                    "pts": int(c[5]) if len(c) > 5 and c[5].isdigit() else 0,
                    "perSet": c[6] if len(c) > 6 else "",
                })
            elif meta["id"] == "attack":
                entry.update({
                    "matches": int(c[3]) if len(c) > 3 and c[3].isdigit() else 0,
                    "sets": int(c[4]) if len(c) > 4 and c[4].isdigit() else 0,
                    "att": int(c[5]) if len(c) > 5 and c[5].isdigit() else 0,
                    "attack": int(c[6]) if len(c) > 6 and c[6].isdigit() else 0,
                    "eff": c[-1] if c else "",
                })
            elif meta["id"] == "block":
                entry.update({
                    "matches": int(c[3]) if len(c) > 3 and c[3].isdigit() else 0,
                    "sets": int(c[4]) if len(c) > 4 and c[4].isdigit() else 0,
                    "block": int(c[5]) if len(c) > 5 and c[5].isdigit() else 0,
                    "perSet": c[6] if len(c) > 6 else "",
                })
            elif meta["id"] == "serve":
                entry.update({
                    "matches": int(c[3]) if len(c) > 3 and c[3].isdigit() else 0,
                    "sets": int(c[4]) if len(c) > 4 and c[4].isdigit() else 0,
                    "ace": int(c[6]) if len(c) > 6 and c[6].isdigit() else 0,
                    "perSet": c[7] if len(c) > 7 else "",
                })
            elif meta["id"] == "receive":
                entry.update({
                    "matches": int(c[3]) if len(c) > 3 and c[3].isdigit() else 0,
                    "sets": int(c[4]) if len(c) > 4 and c[4].isdigit() else 0,
                    "n": c[5] if len(c) > 5 else "",
                    "posPct": c[6] if len(c) > 6 else "",
                    "perf": c[7] if len(c) > 7 else "",
                })
            elif meta["id"] == "dig":
                entry.update({
                    "matches": int(c[3]) if len(c) > 3 and c[3].isdigit() else 0,
                    "sets": int(c[4]) if len(c) > 4 and c[4].isdigit() else 0,
                    "digs": int(c[5]) if len(c) > 5 and c[5].isdigit() else 0,
                    "perSet": c[6] if len(c) > 6 else "",
                })
            players.append(entry)
        rankings.append({
            "id": meta["id"],
            "title": meta["title"],
            "titleEn": meta["titleEn"],
            "titleTr": meta["titleTr"],
            "players": players,
        })
    return rankings

def main():
    r = requests.get(URL, headers=HEADERS, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "html.parser")
    rankings = extract_rankings(soup)
    if not rankings:
        raise SystemExit("Nie udało się sparsować żadnych rankingów")

    today = date.today().isoformat()
    data = {
        "updated": today,
        "phase": "auto",
        "note": f"Rankingi indywidualne PLS – automatyczna aktualizacja {today}. Źródło: tauronligakobiet.pl",
        "noteEn": f"Official PLS rankings – auto update {today}",
        "source": URL,
        "rankings": rankings,
    }
    out = Path("data/scorers.json")
    out.parent.mkdir(exist_ok=True)
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Zapisano {len(rankings)} rankingów do {out}")

if __name__ == "__main__":
    main()
