import React, { useState, useEffect, useMemo } from 'react';
import './RawOddsTable.css';

function RawOddsTable({ username, onLogout }) {
  const [oddsData, setOddsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'game_start_perth', direction: 'asc' });
  const [filters, setFilters] = useState({
    sport: '',
    event: '',
    market: '',
    side: '',
    book: '',
    searchText: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 50;

  // Fetch and parse CSV data
  useEffect(() => {
    const fetchCSV = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/raw_odds_pure.csv');
        if (!response.ok) {
          throw new Error('Failed to fetch CSV file');
        }
        const text = await response.text();
        const rows = parseCSV(text);
        setOddsData(rows);
        setError(null);
      } catch (err) {
        setError(err.message);
        setOddsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCSV();
  }, []);

  // Parse CSV text into array of objects
  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',');
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const row = {};
      headers.forEach((header, index) => {
        row[header.trim()] = values[index] ? values[index].trim() : '';
      });
      data.push(row);
    }
    
    return data;
  };

  // Get unique values for filter dropdowns
  const getUniqueValues = (key) => {
    const values = [...new Set(oddsData.map(row => row[key]).filter(Boolean))];
    return values.sort();
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Apply filters and sorting
  const filteredAndSortedData = useMemo(() => {
    let filtered = [...oddsData];

    // Apply column filters
    Object.keys(filters).forEach(key => {
      if (filters[key] && key !== 'searchText') {
        filtered = filtered.filter(row => 
          row[key] && row[key].toLowerCase().includes(filters[key].toLowerCase())
        );
      }
    });

    // Apply global search
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(row =>
        Object.values(row).some(val => 
          String(val).toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key] || '';
        let bVal = b[sortConfig.key] || '';

        // Try to parse as numbers for numeric sorting
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // String comparison
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
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

  // Get all column headers
  const columns = oddsData.length > 0 ? Object.keys(oddsData[0]) : [];

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  };

  const formatSport = (sport) => {
    const sportMap = {
      'basketball_nba': 'NBA',
      'americanfootball_nfl': 'NFL',
      'icehockey_nhl': 'NHL',
      'soccer_epl': 'EPL',
      'soccer': 'Soccer'
    };
    return sportMap[sport] || sport;
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
          <button onClick={() => window.location.href = '/dashboard'} className="back-btn">
            ← Back to Dashboard
          </button>
          <div>
            <h1>📊 Raw Odds Table</h1>
            <p className="subtitle">Pure raw odds data from all bookmakers (no EV calculations)</p>
          </div>
        </div>

        {/* Global Search */}
        <div className="search-section">
          <input
            type="text"
            placeholder="Search across all columns..."
            value={filters.searchText}
            onChange={(e) => handleFilterChange('searchText', e.target.value)}
            className="global-search"
          />
        </div>

        {/* Column Filters */}
        <div className="filters-section">
          <div className="filter-group">
            <label>Sport:</label>
            <select
              value={filters.sport}
              onChange={(e) => handleFilterChange('sport', e.target.value)}
              className="filter-select"
            >
              <option value="">All Sports</option>
              {getUniqueValues('sport').map(value => (
                <option key={value} value={value}>{formatSport(value)}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Market:</label>
            <select
              value={filters.market}
              onChange={(e) => handleFilterChange('market', e.target.value)}
              className="filter-select"
            >
              <option value="">All Markets</option>
              {getUniqueValues('market').map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Bookmaker:</label>
            <select
              value={filters.book}
              onChange={(e) => handleFilterChange('book', e.target.value)}
              className="filter-select"
            >
              <option value="">All Bookmakers</option>
              {getUniqueValues('book').map(value => (
                <option key={value} value={value}>{value}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Event:</label>
            <input
              type="text"
              placeholder="Filter by event..."
              value={filters.event}
              onChange={(e) => handleFilterChange('event', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Side:</label>
            <input
              type="text"
              placeholder="Filter by side..."
              value={filters.side}
              onChange={(e) => handleFilterChange('side', e.target.value)}
              className="filter-input"
            />
          </div>

          <button 
            onClick={() => {
              setFilters({
                sport: '',
                event: '',
                market: '',
                side: '',
                book: '',
                searchText: ''
              });
              setCurrentPage(1);
            }}
            className="clear-filters-btn"
          >
            Clear All Filters
          </button>
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
            <div className="results-info">
              <p>
                Showing {paginatedData.length} of {filteredAndSortedData.length} rows
                {filteredAndSortedData.length !== oddsData.length && 
                  ` (filtered from ${oddsData.length} total)`
                }
              </p>
            </div>

            <div className="table-wrapper">
              <table className="raw-odds-table">
                <thead>
                  <tr>
                    {columns.map(column => (
                      <th 
                        key={column}
                        onClick={() => handleSort(column)}
                        className="sortable-header"
                      >
                        {column.replace(/_/g, ' ')}
                        {sortConfig.key === column && (
                          <span className="sort-indicator">
                            {sortConfig.direction === 'asc' ? ' ▲' : ' ▼'}
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {columns.map(column => (
                        <td key={column} className={`cell-${column.toLowerCase()}`}>
                          {column === 'game_start_perth' 
                            ? formatDateTime(row[column])
                            : column === 'sport'
                            ? formatSport(row[column])
                            : row[column] || '-'
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="page-btn"
                >
                  Previous
                </button>
                
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
