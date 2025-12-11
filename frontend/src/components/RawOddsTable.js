import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './RawOddsTable.css';

function RawOddsTable({ username, onLogout }) {
  const navigate = useNavigate();
  const [oddsData, setOddsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'game_start_perth', direction: 'asc' });
  
  // Multi-select filter state
  const [filters, setFilters] = useState({
    sport: new Set(),
    event: new Set(),
    market: new Set(),
    selection: new Set(),
    book: new Set(),
    searchText: ''
  });
  
  // Filter panel state
  const [openFilterPanel, setOpenFilterPanel] = useState(null);
  const [filterOptions, setFilterOptions] = useState({
    sport: [],
    event: [],
    market: [],
    selection: [],
    book: []
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
        
        // Build filter options from data (preserving CSV column order)
        buildFilterOptions(rows);
      } catch (err) {
        setError(err.message);
        setOddsData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCSV();
  }, []);

  // Close filter panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const filterBar = document.querySelector('.filters-bar');
      if (filterBar && !filterBar.contains(e.target)) {
        setOpenFilterPanel(null);
      }
    };
    
    if (openFilterPanel) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [openFilterPanel]);

  // Parse CSV text into array of objects with proper handling of quoted fields
  const parseCSV = (text) => {
    const lines = text.trim().split('\n');
    if (lines.length === 0) return [];
    
    // Helper function to parse a CSV line respecting quotes
    const parseLine = (line) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
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
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return data;
  };

  // Format sport name for display
  const formatSport = (sport) => {
    const sportMap = {
      'basketball_nba': 'NBA',
      'americanfootball_nfl': 'NFL',
      'icehockey_nhl': 'NHL',
      'soccer': 'Soccer',
      'tennis': 'Tennis',
      'cricket': 'Cricket'
    };
    return sportMap[sport] || sport;
  };

  // Get unique values for filter dropdowns (preserving order)
  const buildFilterOptions = (data) => {
    const seen = {
      sport: new Set(),
      event: new Set(),
      market: new Set(),
      selection: new Set(),
      book: new Set()
    };
    
    const ordered = {
      sport: [],
      event: [],
      market: [],
      selection: [],
      book: []
    };

    // Preserve CSV order - first occurrence wins
    data.forEach(row => {
      ['sport', 'event', 'market', 'selection', 'book'].forEach(key => {
        const val = row[key];
        if (val && !seen[key].has(val)) {
          seen[key].add(val);
          ordered[key].push(val);
        }
      });
    });

    setFilterOptions(ordered);
  };

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Handle multi-select filter changes
  const toggleFilterValue = (filterKey, value) => {
    setFilters(prev => {
      const newSet = new Set(prev[filterKey]);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return {
        ...prev,
        [filterKey]: newSet
      };
    });
    setCurrentPage(1);
  };

  // Select all values for a filter
  const selectAllFilter = (filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: new Set(filterOptions[filterKey])
    }));
  };

  // Deselect all values for a filter
  const deselectAllFilter = (filterKey) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: new Set()
    }));
  };

  // Handle search changes
  const handleSearchChange = (value) => {
    setFilters(prev => ({
      ...prev,
      searchText: value
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
    ['sport', 'event', 'market', 'selection', 'book'].forEach(key => {
      if (filters[key].size > 0) {
        filtered = filtered.filter(row => 
          filters[key].has(row[key])
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
          <button onClick={() => navigate('/dashboard')} className="back-btn">
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
            placeholder="🔍 Search across all columns..."
            value={filters.searchText}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="global-search"
          />
        </div>

        {/* Interactive Filters Bar */}
        <div className="filters-bar">
          {['sport', 'event', 'market', 'selection', 'book'].map(filterKey => (
            <div key={filterKey} className="filter-button-group">
              <button
                className={`filter-dropdown-btn ${
                  filters[filterKey].size > 0 ? 'active' : ''
                }`}
                onClick={() => setOpenFilterPanel(
                  openFilterPanel === filterKey ? null : filterKey
                )}
              >
                <span className="filter-label">
                  {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
                </span>
                {filters[filterKey].size > 0 && (
                  <span className="filter-badge">{filters[filterKey].size}</span>
                )}
                <span className="dropdown-arrow">
                  {openFilterPanel === filterKey ? '▲' : '▼'}
                </span>
              </button>

              {/* Interactive Filter Panel */}
              {openFilterPanel === filterKey && (
                <div className="filter-panel" onClick={(e) => e.stopPropagation()}>
                  <div className="filter-panel-header">
                    <h4>{filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}</h4>
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
                    {filterOptions[filterKey].map(value => (
                      <label key={value} className="filter-option">
                        <input
                          type="checkbox"
                          checked={filters[filterKey].has(value)}
                          onChange={() => toggleFilterValue(filterKey, value)}
                          className="filter-checkbox"
                        />
                        <span className="filter-option-label">
                          {filterKey === 'sport' ? formatSport(value) : value}
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

          {/* Clear All Button */}
          {(filters.sport.size > 0 || filters.event.size > 0 || 
            filters.market.size > 0 || filters.selection.size > 0 || 
            filters.book.size > 0 || filters.searchText) && (
            <button 
              onClick={() => {
                setFilters({
                  sport: new Set(),
                  event: new Set(),
                  market: new Set(),
                  selection: new Set(),
                  book: new Set(),
                  searchText: ''
                });
                setCurrentPage(1);
              }}
              className="clear-all-filters-btn"
            >
              ✕ Clear All
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
            <div className="results-info">
              <p>
                Showing {paginatedData.length} of {filteredAndSortedData.length} rows
                {filteredAndSortedData.length !== oddsData.length && 
                  ` (filtered from ${oddsData.length} total)`
                }
              </p>
            </div>

            {/* Prominent Top Scroll Bar */}
            <div 
              className="top-scroll-bar"
              onScroll={(e) => {
                const tableWrapper = document.querySelector('.table-wrapper');
                if (tableWrapper) {
                  tableWrapper.scrollLeft = e.target.scrollLeft;
                }
              }}
            >
              <div className="scroll-bar-dummy"></div>
            </div>

            {/* Table Wrapper */}
            <div 
              className="table-wrapper"
              onScroll={(e) => {
                const topScroll = document.querySelector('.top-scroll-bar');
                if (topScroll) {
                  topScroll.scrollLeft = e.target.scrollLeft;
                }
              }}
            >
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
