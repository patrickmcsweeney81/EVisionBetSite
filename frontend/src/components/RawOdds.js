import React, { useState, useEffect, useCallback, useRef } from "react";
import API_URL from "../config";
import {
  getBookmakerLogo,
  getBookmakerDisplayName,
  createFallbackLogo,
} from "../utils/bookmakerLogos";
import "./OddsTable.css";

function RawOdds({ username, onLogout }) {
  const [odds, setOdds] = useState([]);
  const [bookmakerColumns, setBookmakerColumns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 100,
    sport: "",
    market: "",
    minEV: "",
    bookmaker: "",
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [serverLastUpdated, setServerLastUpdated] = useState(null);
  const [refreshIn, setRefreshIn] = useState(120); // seconds until next auto refresh
  const [sortConfig, setSortConfig] = useState({
    key: "ev",
    direction: "desc",
  });
  const fixedTableRef = useRef(null);
  const scrollableRef = useRef(null);
  const [debugInfo, setDebugInfo] = useState({ status: null, message: null });
  const [lastErrorText, setLastErrorText] = useState(null);
  const debugEnabled =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("debug") === "1";
  const useRaw =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("raw") === "1";

  const buildOddsUrl = useCallback(() => {
    const params = new URLSearchParams();
    params.append("limit", filters.limit);
    if (filters.sport) params.append("sport", filters.sport);
    if (filters.market) params.append("market", filters.market);
    if (!useRaw && filters.minEV) params.append("min_ev", filters.minEV);
    if (!useRaw && filters.bookmaker)
      params.append("bookmaker", filters.bookmaker);

    if (useRaw) {
      return `${API_URL}/api/odds/raw?${params.toString()}`;
    }
    return `${API_URL}/api/ev/hits?${params.toString()}`;
  }, [filters, useRaw]);

  // Fetch with simple retry + exponential backoff
  const fetchOdds = useCallback(async () => {
    setLoading(true);
    setError(null);
    const maxRetries = 3;
    let attempt = 0;
    let lastResp = null;
    try {
      const response = await fetch(buildOddsUrl());
      setDebugInfo({ status: response.status, message: response.statusText });

      if (!response.ok) {
        const text = await response.text();
        setLastErrorText(text);
        setOdds([]);
        setLastUpdated(new Date().toISOString());
      } else {
        const data = await response.json();

        const mappedHits = (data.hits || data.rows || []).map((row) => {
          const start =
            row.commence_time || row.game_start_perth || row.commence;
          const eventName =
            row.away_team && row.home_team
              ? `${row.away_team} v ${row.home_team}`
              : row.event || row.event_name || row.selection;

          if (useRaw) {
            const bookCols = {
              pinnacle: row.Pinnacle || null,
              betfair_eu: row.Betfair_EU || row.Betfair_AU || null,
              draftkings: row.Draftkings || null,
              fanduel: row.Fanduel || null,
              sportsbet: row.Sportsbet || null,
              pointsbet: row.Pointsbet || null,
              tab: row.Tab || row.Tabtouch || null,
              neds: row.Neds || null,
              ladbrokes: row.Ladbrokes_AU || row.Ladbrokes || null,
              betrivers: row.Betrivers || null,
              mybookie: row.Mybookie || null,
              betonline: row.Betonline || null,
            };

            return {
              ...bookCols,
              game_start_perth: start,
              sport: row.sport,
              event: eventName,
              market: row.market,
              line: row.point,
              side: row.selection,
              price: null,
              book: null,
              ev: null,
              fair: null,
              prob: null,
            };
          }

          const book = row.bookmaker || row.best_book || row.best_bookmaker;
          const price = row.odds_decimal ?? row.best_odds;
          const fair = row.fair_odds;
          const ev = row.ev_percent;
          const prob = row.implied_prob;

          const bookCols = {
            pinnacle: null,
            betfair_eu: null,
            draftkings: null,
            fanduel: null,
            sportsbet: null,
            pointsbet: null,
            tab: null,
            neds: null,
            ladbrokes: null,
            betrivers: null,
            mybookie: null,
            betonline: null,
          };

          if (book && price) {
            const key = String(book).toLowerCase();
            const mapKey = {
              pinnacle: "pinnacle",
              betfair: "betfair_eu",
              betfaireu: "betfair_eu",
              betfair_eu: "betfair_eu",
              draftkings: "draftkings",
              fanduel: "fanduel",
              sportsbet: "sportsbet",
              pointsbet: "pointsbet",
              tab: "tab",
              tabtouch: "tab",
              neds: "neds",
              ladbrokes: "ladbrokes",
              ladbrokes_au: "ladbrokes",
              betrivers: "betrivers",
              mybookie: "mybookie",
              betonline: "betonline",
            }[key];
            if (mapKey && mapKey in bookCols) {
              bookCols[mapKey] = price;
            }
          }

          return {
            ...row,
            ...bookCols,
            game_start_perth: start,
            event: eventName,
            side: row.selection,
            book,
            price,
            ev,
            fair,
            prob,
          };
        });
        setOdds(mappedHits);

        // Prefer server-provided timestamp if available
        const srvTs = data.last_updated || data.timestamp || null;
        setServerLastUpdated(srvTs);

        // Extract bookmaker columns from the first row
        if (useRaw && mappedHits.length > 0) {
          const firstRow = mappedHits[0];
          const fixedColumns = [
            "sport",
            "commence_time",
            "event_name",
            "market",
            "point",
            "selection",
            "game_start_perth",
            "event",
            "line",
            "side",
            "price",
            "book",
            "ev",
            "fair",
            "prob",
          ];
          const bookCols = Object.keys(firstRow).filter(
            (key) => !fixedColumns.includes(key) && firstRow[key] !== null
          );
          setBookmakerColumns(bookCols);
        }

        setLastUpdated(srvTs || new Date().toISOString());
      }
    } catch (err) {
      // Retry logic on network errors or 5xx
      while (attempt < maxRetries) {
        try {
          const delay = 500 * Math.pow(2, attempt); // 500ms, 1000ms, 2000ms
          await new Promise((res) => setTimeout(res, delay));
          const r = await fetch(buildOddsUrl());
          lastResp = r;
          setDebugInfo({ status: r.status, message: r.statusText });
          if (r.ok) {
            const data = await r.json();
            const mappedHits = (data.hits || data.rows || []).map((row) => {
              const start =
                row.commence_time || row.game_start_perth || row.commence;
              const eventName =
                row.away_team && row.home_team
                  ? `${row.away_team} v ${row.home_team}`
                  : row.event || row.event_name || row.selection;

              if (useRaw) {
                const bookCols = {
                  pinnacle: row.Pinnacle || null,
                  betfair_eu: row.Betfair_EU || row.Betfair_AU || null,
                  draftkings: row.Draftkings || null,
                  fanduel: row.Fanduel || null,
                  sportsbet: row.Sportsbet || null,
                  pointsbet: row.Pointsbet || null,
                  tab: row.Tab || row.Tabtouch || null,
                  neds: row.Neds || null,
                  ladbrokes: row.Ladbrokes_AU || row.Ladbrokes || null,
                  betrivers: row.Betrivers || null,
                  mybookie: row.Mybookie || null,
                  betonline: row.Betonline || null,
                };

                return {
                  ...bookCols,
                  game_start_perth: start,
                  sport: row.sport,
                  event: eventName,
                  market: row.market,
                  line: row.point,
                  side: row.selection,
                  price: null,
                  book: null,
                  ev: null,
                  fair: null,
                  prob: null,
                };
              }

              const book = row.bookmaker || row.best_book || row.best_bookmaker;
              const price = row.odds_decimal ?? row.best_odds;
              const fair = row.fair_odds;
              const ev = row.ev_percent;
              const prob = row.implied_prob;

              const bookCols = {
                pinnacle: null,
                betfair_eu: null,
                draftkings: null,
                fanduel: null,
                sportsbet: null,
                pointsbet: null,
                tab: null,
                neds: null,
                ladbrokes: null,
                betrivers: null,
                mybookie: null,
                betonline: null,
              };

              if (book && price) {
                const key = String(book).toLowerCase();
                const mapKey = {
                  pinnacle: "pinnacle",
                  betfair: "betfair_eu",
                  betfaireu: "betfair_eu",
                  betfair_eu: "betfair_eu",
                  draftkings: "draftkings",
                  fanduel: "fanduel",
                  sportsbet: "sportsbet",
                  pointsbet: "pointsbet",
                  tab: "tab",
                  tabtouch: "tab",
                  neds: "neds",
                  ladbrokes: "ladbrokes",
                  ladbrokes_au: "ladbrokes",
                  betrivers: "betrivers",
                  mybookie: "mybookie",
                  betonline: "betonline",
                }[key];
                if (mapKey && mapKey in bookCols) {
                  bookCols[mapKey] = price;
                }
              }

              return {
                ...row,
                ...bookCols,
                game_start_perth: start,
                event: eventName,
                side: row.selection,
                book,
                price,
                ev,
                fair,
                prob,
              };
            });

            setOdds(mappedHits);
            const srvTs = data.last_updated || data.timestamp || null;
            setServerLastUpdated(srvTs);
            setLastUpdated(srvTs || new Date().toISOString());
            setLoading(false);
            setError(null);
            return; // success
          }
        } catch (retryErr) {
          // continue to next attempt
        }
        attempt += 1;
      }
      // if we get here, all retries failed
      setOdds([]);
      setError(
        lastResp
          ? `Fetch failed (${lastResp.status} ${lastResp.statusText})`
          : "Network error while fetching raw odds"
      );
      setLastUpdated(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  }, [buildOddsUrl]);

  useEffect(() => {
    fetchOdds();
    const interval = setInterval(() => fetchOdds(), 120000);
    return () => clearInterval(interval);
  }, [fetchOdds]);

  // Show a simple countdown to the next auto-refresh to make status visible
  useEffect(() => {
    setRefreshIn(120);
    const t = setInterval(() => {
      setRefreshIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  // Keep left and right tables vertically in sync to avoid row misalignment when scrolling raw data.
  useEffect(() => {
    const right = scrollableRef.current;
    const left = fixedTableRef.current;
    if (!right || !left) return;

    const syncScroll = () => {
      left.scrollTop = right.scrollTop;
    };

    right.addEventListener("scroll", syncScroll);
    return () => {
      right.removeEventListener("scroll", syncScroll);
    };
  }, []);

  const formatTime = (timeString) => {
    if (!timeString) return "TBA";
    try {
      const date = new Date(timeString);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return timeString;
    }
  };

  const formatSport = (sport) => {
    const sportMap = {
      basketball_nba: "NBA",
      basketball: "BBall",
      americanfootball_nfl: "NFL",
      icehockey_nhl: "NHL",
      soccer: "Soccer",
    };
    return sportMap[sport] || sport;
  };

  const getLogoBadges = (row) => {
    const logoKeys = [
      "book",
      "pinnacle",
      "betfair",
      "sportsbet",
      "bet365",
      "pointsbet",
      "ladbrokes",
      "unibet",
      "dabble",
      "tab",
      "tabtouch",
      "neds",
      "betr",
      "betright",
    ];
    const present = [];
    logoKeys.forEach((k) => {
      if (k === "book") {
        if (row.book) present.push(row.book);
      } else if (row[k] !== null && row[k] !== undefined) {
        present.push(k);
      }
    });
    return present.slice(0, 6).map((bk, idx) => (
      <span
        key={idx}
        className={`logo-badge logo-${bk.toLowerCase()}`}
        style={{ marginRight: 6 }}
      >
        <img
          src={getBookmakerLogo(bk, { size: 28 })}
          alt={getBookmakerDisplayName(bk)}
          width={28}
          height={28}
          onError={(e) => {
            if (!e.currentTarget.dataset.fallback) {
              e.currentTarget.src = createFallbackLogo(bk, 28);
              e.currentTarget.dataset.fallback = "true";
            } else {
              console.warn(
                `Bookmaker logo and fallback failed to load for: ${bk}.`
              );
            }
          }}
        />
      </span>
    ));
  };

  const addToTracker = (row) => {
    const csvData = [
      {
        Date: formatTime(row.game_start_perth),
        Sport: formatSport(row.sport),
        Event: row.event,
        Market: row.market,
        Line: row.line || "",
        Side: row.side,
        Bookmaker: row.book,
        Price: row.price,
        "EV%": row.ev || 0,
        Stake: row.stake || 0,
        Fair: row.fair || 0,
        Pinnacle: row.pinnacle || 0,
        "Prob%": row.prob || 0,
      },
    ];

    const headers = Object.keys(csvData[0]).join(",");
    const values = Object.values(csvData[0])
      .map((val) =>
        typeof val === "string" && val.includes(",") ? `"${val}"` : val
      )
      .join(",");
    const csv = `${headers}\n${values}`;

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `bet_tracker_${row.event.replace(
      /\s+/g,
      "_"
    )}_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    alert("✅ Added to tracker! CSV file downloaded.");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      limit: 100,
      sport: "",
      market: "",
      minEV: "",
      bookmaker: "",
    });
  };

  return (
    <div className="odds-table-container">
      <div className="odds-header">
        {debugEnabled && (
          <div className="debug-bar">
            <span>API: {API_URL}</span>
            <span>
              {" "}
              | Status: {debugInfo.status ?? "n/a"}{" "}
              {debugInfo.message ? `(${debugInfo.message})` : ""}
            </span>
            <span>
              {" "}
              |{" "}
              <a href={buildOddsUrl()} target="_blank" rel="noreferrer">
                Open API
              </a>
            </span>
            {lastErrorText && (
              <span> | Error: {lastErrorText.slice(0, 120)}...</span>
            )}
          </div>
        )}

        {debugInfo.status === 404 && (
          <div className="info-banner">
            <p>⚠️ Backend service is currently offline. Showing empty state.</p>
          </div>
        )}

        <div className="header-left">
          <button
            onClick={() => (window.location.href = "/dashboard")}
            className="back-btn"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1>📈 Expected Value Finder</h1>
            {lastUpdated && (
              <p className="last-update">
                Last updated: {new Date(lastUpdated).toLocaleString()}
                {serverLastUpdated &&
                  ` (server: ${new Date(serverLastUpdated).toLocaleString()})`}
                {typeof refreshIn === "number" &&
                  ` • auto-refresh in ${refreshIn}s`}
              </p>
            )}
          </div>
        </div>
        <button onClick={fetchOdds} className="refresh-btn">
          🔄 Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Limit</label>
          <select
            name="limit"
            value={filters.limit}
            onChange={handleFilterChange}
            className="filter-input"
          >
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
            <option value="200">200</option>
            <option value="500">500</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Sport</label>
          <input
            type="text"
            name="sport"
            value={filters.sport}
            onChange={handleFilterChange}
            placeholder="e.g., basketball_nba"
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Market</label>
          <input
            type="text"
            name="market"
            value={filters.market}
            onChange={handleFilterChange}
            placeholder="e.g., player_points"
            className="filter-input"
          />
        </div>

        {!useRaw && (
          <div className="filter-group">
            <label>Min EV %</label>
            <input
              type="number"
              name="minEV"
              value={filters.minEV}
              onChange={handleFilterChange}
              placeholder="e.g., 3"
              step="0.5"
              min="0"
              className="filter-input"
            />
          </div>
        )}

        <div className="filter-group">
          <label>Bookmaker</label>
          <select
            name="bookmaker"
            value={filters.bookmaker}
            onChange={handleFilterChange}
            className="filter-input"
          >
            <option value="">All Bookmakers</option>
            <option value="pinnacle">Pinnacle</option>
            <option value="betfair_ex_eu">Betfair Exchange</option>
            <option value="draftkings">DraftKings</option>
            <option value="fanduel">FanDuel</option>
            <option value="sportsbet">Sportsbet</option>
            <option value="pointsbet_au">PointsBet AU</option>
            <option value="tab">TAB</option>
            <option value="neds">Neds</option>
            <option value="williamhill_au">William Hill AU</option>
            <option value="betmgm">BetMGM</option>
            <option value="caesars">Caesars</option>
            <option value="betonlineag">BetOnline.ag</option>
          </select>
        </div>

        <button onClick={clearFilters} className="clear-filters-btn">
          ✖ Clear Filters
        </button>
        <button
          onClick={() => {
            clearFilters();
            fetchOdds();
          }}
          className="reset-all-btn"
        >
          🔄 Reset All
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="error-message">
          <p>❌ {error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-message">
          <p>Loading Raw Odds Data...</p>
        </div>
      )}

      {/* Raw Odds Table */}
      {!loading && !error && odds.length > 0 && (
        <div className="split-table-container">
          {/* Fixed Left Section */}
          <div className="fixed-left-section" ref={fixedTableRef}>
            <table className="fixed-table">
              <thead>
                <tr>
                  <th>Sport</th>
                  <th>Start</th>
                  <th>Event</th>
                  <th>Market</th>
                  <th>Point</th>
                  <th>Selection</th>
                </tr>
              </thead>
              <tbody>
                {odds.map((row, idx) => (
                  <tr key={idx}>
                    <td className="sport-cell">{formatSport(row.sport)}</td>
                    <td className="time-cell">
                      {formatTime(row.commence_time)}
                    </td>
                    <td className="event-cell" title={row.event_name}>
                      {row.event_name}
                    </td>
                    <td className="market-cell">{row.market || "-"}</td>
                    <td className="point-cell">{row.point || "-"}</td>
                    <td className="selection-cell">{row.selection || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Scrollable Right Section */}
          <div className="scrollable-right-section" ref={scrollableRef}>
            <table className="scrollable-table">
              <thead>
                <tr>
                  {bookmakerColumns.map((book) => (
                    <th key={book} title={book}>
                      {book}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {odds.map((row, idx) => (
                  <tr key={idx}>
                    {bookmakerColumns.map((book) => (
                      <td key={book} className="bookmaker-cell">
                        {row[book] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* No Data State */}
      {!loading && !error && odds.length === 0 && (
        <div className="no-data-message">
          <p>No odds data available. Try adjusting filters or refreshing.</p>
        </div>
      )}
    </div>
  );
}

export default RawOdds;
