import React, { useState, useEffect, useMemo, useCallback } from "react";
import API_URL from "../config";
import { useNavigate } from "react-router-dom";
import "./RawOddsTable.css";

function RawOddsTable({ username, onLogout }) {
  const navigate = useNavigate();
  const [oddsData, setOddsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "commence_time",
    direction: "asc",
  });
  const [apiTotalCount, setApiTotalCount] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [serverLastUpdated, setServerLastUpdated] = useState(null);
  const [refreshIn, setRefreshIn] = useState(120);

  // Multi-select filter state
  const [filters, setFilters] = useState({
    sport: new Set(),
    away_team: new Set(),
    home_team: new Set(),
    market: new Set(),
    selection: new Set(),
    bookmaker: new Set(),
    searchText: "",
  });

  // Filter panel state
  const [openFilterPanel, setOpenFilterPanel] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    sport: [],
    away_team: [],
    home_team: [],
    market: [],
    selection: [],
    bookmaker: [],
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;
  const fetchLimit = 5000; // pull more than the previous 500-row cap

  // Fetch raw odds via backend API with retry backoff; re-used by auto-refresh and reconnect button
  const fetchRaw = useCallback(async () => {
    const url = `${API_URL}/api/odds/raw?limit=${fetchLimit}&offset=0`;
    const maxRetries = 3;
    let attempt = 0;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url, {
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch raw odds (${response.status})`);
      }
      const data = await response.json();
      const rows = (data.rows || []).map((r) => {
        const { timestamp, event_id, ...rest } = r || {};
        return {
          ...rest,
          away_team: r?.away_team || "",
          home_team: r?.home_team || "",
        };
      });
      setApiTotalCount(data.total_count ?? rows.length);
      // Always record client fetch time, show server timestamp separately
      setServerLastUpdated(data.last_updated || data.timestamp || null);
      setLastUpdated(new Date().toISOString());
      setOddsData(rows);
      setError(null);
      buildFilterOptions(rows);
    } catch (err) {
      while (attempt < maxRetries) {
        try {
          const delay = 500 * Math.pow(2, attempt);
          await new Promise((res) => setTimeout(res, delay));
          const r = await fetch(url, { headers: { "Cache-Control": "no-cache" } });
          if (r.ok) {
            const data = await r.json();
            const rows = (data.rows || []).map((x) => ({
              ...x,
              away_team: x?.away_team || "",
              home_team: x?.home_team || "",
            }));
            setApiTotalCount(data.total_count ?? rows.length);
            setServerLastUpdated(data.last_updated || data.timestamp || null);
            setLastUpdated(new Date().toISOString());
            setOddsData(rows);
            setError(null);
            buildFilterOptions(rows);
            setLoading(false);
            return;
          }
        } catch (retryErr) {
          // continue
        }
        attempt += 1;
      }
      setError(err.message || "Network error fetching raw odds");
      setOddsData([]);
    } finally {
      setLoading(false);
    }
  }, [fetchLimit]);

  // Auto-refresh every 2 minutes
  useEffect(() => {
    fetchRaw();
    const interval = setInterval(fetchRaw, 120000);
    return () => clearInterval(interval);
  }, [fetchRaw]);

  // Visible countdown to next auto-refresh
  useEffect(() => {
    setRefreshIn(120);
    const t = setInterval(() => setRefreshIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [lastUpdated]);

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const filterBar = document.querySelector(".filters-bar");
      if (filterBar && !filterBar.contains(e.target)) {
        setOpenFilterPanel(null);
      }
    };

    if (openFilterPanel) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openFilterPanel]);

  // Parse CSV text into array of objects with proper handling of quoted fields
  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    if (lines.length === 0) return [];

    // Helper function to parse a CSV line respecting quotes
    const parseLine = (line) => {
      const result = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]);
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      data.push(row);
    }

    return data;
  };

  // Format sport name for display
  const formatSport = (sport) => {
    const sportMap = {
      basketball_nba: "NBA",
      americanfootball_nfl: "NFL",
      icehockey_nhl: "NHL",
      soccer: "Soccer",
      tennis: "Tennis",
      cricket: "Cricket",
    };
    return sportMap[sport] || sport;
  };

  // Get unique values for filter dropdowns (preserving order)
  const buildFilterOptions = (data) => {
    const keys = ["sport", "away_team", "home_team", "market", "selection"];
    const seen = Object.fromEntries(keys.map((k) => [k, new Set()]));
    const ordered = Object.fromEntries(keys.map((k) => [k, []]));
    const bookmakerSeen = new Set();
    const bookmakerOrdered = [];

    data.forEach((row) => {
      keys.forEach((key) => {
        const val = row[key];
        if (val && !seen[key].has(val)) {
          seen[key].add(val);
          ordered[key].push(val);
        }
      });

      // Extract bookmakers from non-baseColumn fields
      Object.keys(row).forEach((key) => {
        if (!baseColumns.includes(key)) {
          if (row[key] && !bookmakerSeen.has(key)) {
            bookmakerSeen.add(key);
            bookmakerOrdered.push(key);
          }
        }
      });
    });

    setFilterOptions({
      ...ordered,
      bookmaker: bookmakerOrdered,
    });
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Handle multi-select filter changes
  const toggleFilterValue = (filterKey, value) => {
    setFilters((prev) => {
      const newSet = new Set(prev[filterKey]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return {
        ...prev,
        [filterKey]: newSet,
      };
    });
    setCurrentPage(1);
  };

  // Select all values for a filter
  const selectAllFilter = (filterKey) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: new Set(filterOptions[filterKey]),
    }));
  };

  // Deselect all values for a filter
  const deselectAllFilter = (filterKey) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: new Set(),
    }));
  };

  // Handle search changes
  const handleSearchChange = (value) => {
    setFilters((prev) => ({
      ...prev,
      searchText: value,
    }));
    setCurrentPage(1);
  };

  // Close filter panel and reset if needed
  const closeFilterPanel = () => {
    setOpenFilterPanel(null);
  };

  // Apply filters and sorting
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...oddsData];

    // Apply multi-select filters
    ["sport", "away_team", "home_team", "market", "selection"].forEach(
      (key) => {
        if (filters[key].size > 0) {
          filtered = filtered.filter((row) => filters[key].has(row[key]));
        }
      }
    );

    // Apply bookmaker filter
    if (filters.bookmaker.size > 0) {
      filtered = filtered.filter((row) => {
        // Check if any selected bookmaker has a value for this row
        return Array.from(filters.bookmaker).some((bookie) => row[bookie]);
      });
    }

    // Apply global search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter((row) =>
        Object.values(row).some((val) =>
          String(val).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key] || "";
        let bVal = b[sortConfig.key] || "";

        // Try to parse as numbers for numeric sorting
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
        }

        // String comparison
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [oddsData, filters, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Get ordered column headers: core fields first, then remaining bookmaker columns in original order
  const baseColumns = [
    "commence_time",
    "sport",
    "away_team",
    "home_team",
    "market",
    "point",
    "selection",
  ];

  const columns = useMemo(() => {
    if (oddsData.length === 0) return [];
    const allCols = Object.keys(oddsData[0]);
    const remaining = allCols.filter((c) => !baseColumns.includes(c));
    return baseColumns.filter((c) => allCols.includes(c)).concat(remaining);
  }, [oddsData]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const handleReconnect = () => {
    setRefreshIn(120);
    fetchRaw();
  };

  return (
    <div className="raw-odds-container">
      <nav className="raw-odds-nav">
        <div className="nav-content">
          <img
            src="/img/bet-evision-horizontal.png"
            alt="BET EVision"
            className="nav-logo"
          />
          <div className="nav-right">
            <span className="username-display">Welcome, {username}!</span>
            <button onClick={onLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="raw-odds-content">
        <div className="raw-odds-header">
          <div className="header-left">
            <button onClick={() => navigate("/dashboard")} className="back-btn">
              ← Back to Dashboard
            </button>
            <div>
              <h1>📊 Raw Odds Table</h1>
              <p className="subtitle">
                Pure raw odds data from all bookmakers (no EV calculations)
              </p>
            </div>
          </div>

          <div className="refresh-status-card">
            <div className="refresh-row">
              <span className="refresh-label">Auto-refresh</span>
              {typeof refreshIn === "number" && (
                <span className="refresh-countdown">in {refreshIn}s</span>
              )}
            </div>
            <div className="refresh-timestamps">
              <span>
                Client: {lastUpdated ? formatDateTime(lastUpdated) : "n/a"}
              </span>
              {serverLastUpdated && (
                <span>Server: {formatDateTime(serverLastUpdated)}</span>
              )}
            </div>
            <button className="refresh-button" onClick={handleReconnect}>
              Reconnect
            </button>
          </div>
        </div>

        {/* Global Search */}
        <div className="search-section">
          <input
            type="text"
            placeholder="🔍 Search across all columns..."
            value={filters.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="global-search"
          />
        </div>

        {/* Interactive Filters Bar */}
        <div className="filters-bar">
          {[
            "sport",
            "away_team",
            "home_team",
            "market",
            "selection",
            "bookmaker",
          ].map((filterKey) => (
            <div key={filterKey} className="filter-button-group">
              <button
                className={`filter-dropdown-btn ${
                  filters[filterKey].size > 0 ? "active" : ""
                }`}
                onClick={() =>
                  setOpenFilterPanel(
                    openFilterPanel === filterKey ? null : filterKey
                  )
                }
              >
                <span className="filter-label">
                  {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
                </span>
                {filters[filterKey].size > 0 && (
                  <span className="filter-badge">
                    {filters[filterKey].size}
                  </span>
                )}
                <span className="dropdown-arrow">
                  {openFilterPanel === filterKey ? "▲" : "▼"}
                </span>
              </button>

              {/* Interactive Filter Panel */}
              {openFilterPanel === filterKey && (
                <div
                  className="filter-panel"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="filter-panel-header">
                    <h4>
                      {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
                    </h4>
                    <div className="filter-panel-actions">
                      <button
                        className="select-all-btn"
                        onClick={() => selectAllFilter(filterKey)}
                      >
                        Select All
                      </button>
                      <button
                        className="deselect-all-btn"
                        onClick={() => deselectAllFilter(filterKey)}
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <div className="filter-options-list">
                    {filterOptions[filterKey].map((value) => (
                      <label key={value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filters[filterKey].has(value)}
                          onChange={() => toggleFilterValue(filterKey, value)}
                          className="filter-checkbox"
                        />
                        <span className="filter-option-label">
                          {filterKey === "sport"
                            ? formatSport(value)
                            : filterKey === "bookmaker"
                            ? value.replace(/_/g, " ").toUpperCase()
                            : value}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="filter-panel-footer">
                    <button
                      className="close-filter-btn"
                      onClick={closeFilterPanel}
                    >
                      ✓ Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Select All Filters Button */}
          <button
            onClick={() => {
              setFilters({
                sport: new Set(filterOptions.sport),
                away_team: new Set(filterOptions.away_team),
                home_team: new Set(filterOptions.home_team),
                market: new Set(filterOptions.market),
                selection: new Set(filterOptions.selection),
                bookmaker: new Set(filterOptions.bookmaker),
                searchText: "",
              });
              setCurrentPage(1);
            }}
            className="select-all-filters-btn"
          >
            ✓ Select All Filters
          </button>

          {/* Clear All Button */}
          {(filters.sport.size > 0 ||
            filters.away_team.size > 0 ||
            filters.home_team.size > 0 ||
            filters.market.size > 0 ||
            filters.selection.size > 0 ||
            filters.bookmaker.size > 0 ||
            filters.searchText) && (
            <button
              onClick={() => {
                setFilters({
                  sport: new Set(),
                  away_team: new Set(),
                  home_team: new Set(),
                  market: new Set(),
                  selection: new Set(),
                  bookmaker: new Set(),
                  searchText: "",
                });
                setCurrentPage(1);
              }}
              className="clear-all-filters-btn"
            >
              ✕ RESET
            </button>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state">
            <p>Loading raw odds data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p>❌ Error: {error}</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <>
            {/* Single unified table with sticky core columns on left */}
            <div className="table-wrapper">
              <div
                className="top-scroll-bar"
                onScroll={(e) => {
                  const scrollContainer = document.querySelector(
                    ".table-scroll-container"
                  );
                  if (scrollContainer) {
                    scrollContainer.scrollLeft = e.target.scrollLeft;
                  }
                }}
              >
                <div className="scroll-bar-dummy"></div>
              </div>

              <div
                className="table-scroll-container"
                onScroll={(e) => {
                  const topScroll = document.querySelector(".top-scroll-bar");
                  if (topScroll) {
                    topScroll.scrollLeft = e.target.scrollLeft;
                  }
                }}
              >
                <table className="raw-odds-table">
                  <thead>
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          onClick={() => handleSort(column)}
                          className={`sortable-header ${
                            baseColumns.includes(column) ? "sticky-core" : ""
                          }`}
                        >
                          {column.replace(/_/g, " ")}
                          {sortConfig.key === column && (
                            <span className="sort-indicator">
                              {sortConfig.direction === "asc" ? " ▲" : " ▼"}
                            </span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {columns.map((column) => (
                          <td
                            key={column}
                            className={`cell-${column.toLowerCase()} ${
                              baseColumns.includes(column) ? "sticky-core" : ""
                            }`}
                          >
                            {column === "commence_time"
                              ? formatDateTime(row[column])
                              : column === "sport"
                              ? formatSport(row[column])
                              : row[column] ?? "-"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="results-info results-info-bottom">
              <p>
                Showing {paginatedData.length} of {filteredAndSortedData.length}{" "}
                rows
                {filteredAndSortedData.length !== oddsData.length &&
                  ` (filtered from ${oddsData.length} loaded)`}
                {apiTotalCount !== null && ` | Server total: ${apiTotalCount}`}
              </p>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  Previous
                </button>

                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="page-btn"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}

        {!loading && !error && filteredAndSortedData.length === 0 && (
          <div className="empty-state">
            <p>No data matches your current filters.</p>
            <p>Try adjusting or clearing your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RawOddsTable;
