from __future__ import annotations

import os
import time
from dataclasses import dataclass
from typing import Dict, Optional

import requests


@dataclass
class InjuryResult:
    source: str
    status: Optional[str]
    detail: Optional[str]
    last_updated_ts: Optional[float]

    def as_dict(self) -> Dict[str, Optional[str]]:
        return {
            "source": self.source,
            "status": self.status,
            "detail": self.detail,
            "last_updated": (
                None
                if self.last_updated_ts is None
                else time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(self.last_updated_ts))
            ),
        }


def _normalize_status(text: Optional[str]) -> Optional[str]:
    if not text:
        return None
    t = text.strip().lower()
    if any(x in t for x in ["out", "inactive"]):
        return "OUT"
    if "doubt" in t or "question" in t:
        return "QUESTIONABLE"
    if "probable" in t:
        return "PROBABLE"
    if any(x in t for x in ["active", "healthy"]):
        return "ACTIVE"
    if "day-to-day" in t:
        return "DAY_TO_DAY"
    return text.upper()


def query_balldontlie(player: str) -> InjuryResult:
    try:
        r = requests.get(
            "https://www.balldontlie.io/api/v1/players",
            params={"search": player},
            timeout=8,
        )
        r.raise_for_status()
        data = r.json().get("data", [])
        if not data:
            return InjuryResult("BALLDONTLIE", None, None, None)
        pid = data[0].get("id")
        r2 = requests.get(
            "https://www.balldontlie.io/api/v1/season_averages",
            params={"player_ids[]": pid},
            timeout=8,
        )
        r2.raise_for_status()
        avgs = (r2.json() or {}).get("data", [])
        minutes = None
        if avgs:
            minutes = avgs[0].get("min")
        status = "ACTIVE" if minutes not in (None, 0, "0") else "QUESTIONABLE"
        return InjuryResult("BALLDONTLIE", _normalize_status(status), None, time.time())
    except Exception:
        return InjuryResult("BALLDONTLIE", None, None, None)


def query_thesportsdb(player: str, league: str) -> InjuryResult:
    try:
        api_key = os.getenv("THESPORTSDB_API_KEY", "2")
        r = requests.get(
            f"https://www.thesportsdb.com/api/v1/json/{api_key}/searchplayers.php",
            params={"p": player},
            timeout=10,
        )
        r.raise_for_status()
        players = (r.json() or {}).get("player") or []
        if not players:
            return InjuryResult("TheSportsDB", None, None, None)
        p0 = players[0]
        detail = p0.get("strInjury") or p0.get("strDescriptionEN")
        status = "QUESTIONABLE" if detail else "ACTIVE"
        return InjuryResult("TheSportsDB", _normalize_status(status), detail, time.time())
    except Exception:
        return InjuryResult("TheSportsDB", None, None, None)


def query_apisports(player: str, league: str) -> InjuryResult:
    try:
        api_key = os.getenv("API_SPORTS_KEY")
        if not api_key:
            return InjuryResult("API-SPORTS", None, None, None)
        headers = {"x-apisports-key": api_key}
        sport = league.upper()
        if sport == "NBA":
            r = requests.get(
                "https://v1.basketball.api-sports.io/injuries",
                params={"search": player},
                headers=headers,
                timeout=10,
            )
        elif sport == "NFL":
            r = requests.get(
                "https://v1.american-football.api-sports.io/injuries",
                params={"search": player},
                headers=headers,
                timeout=10,
            )
        elif sport == "NHL":
            r = requests.get(
                "https://v1.hockey.api-sports.io/injuries",
                params={"search": player},
                headers=headers,
                timeout=10,
            )
        else:
            return InjuryResult("API-SPORTS", None, None, None)
        r.raise_for_status()
        payload = r.json() or {}
        results = payload.get("response") or payload.get("results") or []
        if not results:
            return InjuryResult("API-SPORTS", "ACTIVE", None, time.time())
        first = results[0]
        status_text = first.get("type") or first.get("status") or "QUESTIONABLE"
        detail = first.get("reason") or first.get("description")
        updated = first.get("update") or first.get("date")
        ts = None
        if updated:
            try:
                from datetime import datetime
                ts = datetime.fromisoformat(updated.replace("Z", "+00:00")).timestamp()
            except Exception:
                ts = None
        return InjuryResult("API-SPORTS", _normalize_status(status_text), detail, ts)
    except Exception:
        return InjuryResult("API-SPORTS", None, None, None)


def merge_results(r1: InjuryResult, r2: InjuryResult, r3: InjuryResult) -> Dict[str, object]:
    statuses = [s for s in [r1.status, r2.status, r3.status] if s]
    detail = next((d for d in [r1.detail, r2.detail, r3.detail] if d), None)
    consensus = None
    confidence = "LOW"
    if statuses:
        if len(set(statuses)) == 1:
            consensus = statuses[0]
            confidence = "HIGH"
        else:
            from collections import Counter
            c = Counter(statuses)
            consensus, count = c.most_common(1)[0]
            confidence = "MEDIUM" if count >= 2 else "LOW"
    last_updated = max(
        [t for t in [r1.last_updated_ts, r2.last_updated_ts, r3.last_updated_ts] if t],
        default=None,
    )
    last_updated_str = (
        None if last_updated is None else time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime(last_updated))
    )
    sources = [r1.as_dict(), r2.as_dict(), r3.as_dict()]
    return {
        "injury_status": consensus,
        "injury_detail": detail,
        "last_updated": last_updated_str,
        "confidence": confidence,
        "sources": sources,
        "note": (
            None
            if not statuses or len(set(statuses)) == 1
            else "Conflicting reports — double check before betting"
        ),
    }


def check_injury(player: str, league: str) -> Dict[str, object]:
    league = league.upper().strip()
    r_bdl = query_balldontlie(player) if league == "NBA" else InjuryResult("BALLDONTLIE", None, None, None)
    r_tsd = query_thesportsdb(player, league)
    r_api = query_apisports(player, league)
    return merge_results(r_bdl, r_tsd, r_api)
