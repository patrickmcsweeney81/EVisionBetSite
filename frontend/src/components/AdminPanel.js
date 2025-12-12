import React, { useState } from "react";
import "./AdminPanel.css";

/**
 * Admin/Designer Panel
 * - Login with password
 * - Download database CSVs
 * - View database statistics
 * - Real-time data from PostgreSQL
 */

function AdminPanel() {
  const [authToken, setAuthToken] = useState(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState("");

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/auth?password=${encodeURIComponent(password)}`,
        { method: "POST" }
      );

      if (response.ok) {
        const data = await response.json();
        setAuthToken(data.token);
        setPassword("");
        setMessage("✅ Logged in as admin");
        // Load stats
        loadStats(data.token);
      } else {
        setLoginError("❌ Invalid password");
      }
    } catch (error) {
      setLoginError(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load database stats
  const loadStats = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/database-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  // Download EV opportunities CSV
  const handleDownloadEV = async () => {
    if (!authToken) return;

    try {
      setMessage("⏳ Downloading EV opportunities...");
      const response = await fetch(`${API_URL}/api/admin/ev-opportunities-csv`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `ev_opportunities_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setMessage("✅ EV opportunities CSV downloaded");
      } else {
        setMessage("❌ Error downloading CSV");
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  // Download raw odds CSV
  const handleDownloadRawOdds = async () => {
    if (!authToken) return;

    try {
      setMessage("⏳ Downloading raw odds...");
      const response = await fetch(`${API_URL}/api/admin/raw-odds-csv`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `raw_odds_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setMessage("✅ Raw odds CSV downloaded");
      } else {
        setMessage("❌ Error downloading CSV");
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setAuthToken(null);
    setPassword("");
    setStats(null);
    setMessage("");
    setLoginError("");
  };

  if (!authToken) {
    return (
      <div className="admin-panel">
        <div className="admin-card login-card">
          <h2>🔐 Admin Access</h2>
          <p>Designer/Admin login to download database CSVs</p>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                disabled={loading}
              />
            </div>

            {loginError && <div className="error-message">{loginError}</div>}

            <button type="submit" disabled={loading} className="login-btn">
              {loading ? "⏳ Logging in..." : "Login"}
            </button>
          </form>

          <p className="hint">💡 Default: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="admin-card">
        <div className="admin-header">
          <h2>📊 Admin Dashboard</h2>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes("✅") ? "success" : ""}`}>
            {message}
          </div>
        )}

        {/* Database Stats */}
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">EV Opportunities</div>
              <div className="stat-value">{stats.ev_opportunities.count}</div>
              <div className="stat-updated">
                {stats.ev_opportunities.latest_update
                  ? new Date(stats.ev_opportunities.latest_update).toLocaleString()
                  : "Never"}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Raw Odds Rows</div>
              <div className="stat-value">{stats.live_odds.count}</div>
              <div className="stat-updated">
                {stats.live_odds.latest_update
                  ? new Date(stats.live_odds.latest_update).toLocaleString()
                  : "Never"}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Price History Records</div>
              <div className="stat-value">{stats.price_history.count}</div>
            </div>
          </div>
        )}

        {/* Download Buttons */}
        <div className="download-section">
          <h3>📥 Download Database CSVs</h3>
          <div className="button-group">
            <button onClick={handleDownloadEV} className="download-btn ev-btn">
              💾 Download EV Opportunities CSV
            </button>
            <button
              onClick={handleDownloadRawOdds}
              className="download-btn odds-btn"
            >
              💾 Download Raw Odds CSV
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="admin-info">
          <h3>ℹ️ About This Page</h3>
          <ul>
            <li>✅ Download complete PostgreSQL database as CSV</li>
            <li>✅ Real-time data directly from database</li>
            <li>✅ Works on any computer with internet access</li>
            <li>✅ Admin/Designer access only</li>
            <li>📊 Data updates every 30 minutes via cron job</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;
