import React, { useState } from 'react';
import './DutchingCalculator.css';

function DutchingCalculator({ username, onLogout }) {
  const [totalStake, setTotalStake] = useState(100);
  const [selections, setSelections] = useState([
    { id: 1, name: 'Selection 1', odds: 2.0 },
    { id: 2, name: 'Selection 2', odds: 3.0 }
  ]);

  const handleLogout = () => {
    onLogout();
    window.location.href = '/';
  };

  const addSelection = () => {
    const newId = Math.max(...selections.map(s => s.id)) + 1;
    setSelections([...selections, { id: newId, name: `Selection ${newId}`, odds: 2.0 }]);
  };

  const removeSelection = (id) => {
    if (selections.length > 2) {
      setSelections(selections.filter(s => s.id !== id));
    }
  };

  const updateSelection = (id, field, value) => {
    setSelections(selections.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const calculateDutching = () => {
    const oddsSum = selections.reduce((sum, sel) => sum + (1 / sel.odds), 0);
    return selections.map(sel => ({
      ...sel,
      stake: (totalStake / (sel.odds * oddsSum)).toFixed(2),
      potentialProfit: ((totalStake / oddsSum) - totalStake).toFixed(2)
    }));
  };

  const results = calculateDutching();
  const totalReturn = results.length > 0 ? (parseFloat(results[0].stake) * parseFloat(results[0].odds)).toFixed(2) : 0;
  const profit = (totalReturn - totalStake).toFixed(2);

  return (
    <div className="dutching-container">
      <nav className="dashboard-nav">
        <div className="nav-content">
          <img 
            src="/img/bet-evision-horizontal.png" 
            alt="BET EVision" 
            className="nav-logo"
          />
          <div className="nav-right">
            <span className="username-display">Welcome, {username}!</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dutching-content">
        <div className="page-header">
          <button onClick={() => window.location.href = '/ev-toolbox'} className="back-btn">
            ← Back to EV Toolbox
          </button>
          <h1>🎲 Dutching Calculator</h1>
          <p className="subtitle">Calculate optimal stake distribution across multiple selections</p>
        </div>

        <div className="calculator-grid">
          <div className="input-section">
            <div className="stake-input">
              <label>Total Stake ($)</label>
              <input 
                type="number" 
                value={totalStake}
                onChange={(e) => setTotalStake(parseFloat(e.target.value) || 0)}
                min="0"
                step="10"
              />
            </div>

            <div className="selections-section">
              <div className="selections-header">
                <h3>Selections</h3>
                <button onClick={addSelection} className="add-btn">+ Add Selection</button>
              </div>
              
              {selections.map((sel, index) => (
                <div key={sel.id} className="selection-row">
                  <span className="selection-number">{index + 1}</span>
                  <input 
                    type="text"
                    placeholder="Selection name"
                    value={sel.name}
                    onChange={(e) => updateSelection(sel.id, 'name', e.target.value)}
                    className="selection-name"
                  />
                  <input 
                    type="number"
                    placeholder="Odds"
                    value={sel.odds}
                    onChange={(e) => updateSelection(sel.id, 'odds', parseFloat(e.target.value) || 1.01)}
                    min="1.01"
                    step="0.01"
                    className="selection-odds"
                  />
                  {selections.length > 2 && (
                    <button 
                      onClick={() => removeSelection(sel.id)}
                      className="remove-btn"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="info-box">
              <h4>💡 What is Dutching?</h4>
              <p>
                Dutching is a betting strategy where you back multiple selections in the same event to 
                guarantee the same profit regardless of which selection wins. The calculator distributes 
                your total stake proportionally based on the odds.
              </p>
            </div>
          </div>

          <div className="results-section">
            <h3>📊 Dutching Results</h3>
            
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-label">Total Stake</div>
                <div className="summary-value">${totalStake.toFixed(2)}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Total Return</div>
                <div className="summary-value">${totalReturn}</div>
              </div>
              <div className="summary-card">
                <div className="summary-label">Profit</div>
                <div className={`summary-value ${profit >= 0 ? 'positive' : 'negative'}`}>
                  ${profit}
                </div>
              </div>
            </div>

            <div className="results-table">
              <div className="results-header">
                <div>Selection</div>
                <div>Odds</div>
                <div>Stake</div>
                <div>Return</div>
              </div>
              {results.map((result, index) => (
                <div key={result.id} className="results-row">
                  <div className="result-name">{result.name}</div>
                  <div className="result-odds">{result.odds.toFixed(2)}</div>
                  <div className="result-stake">${result.stake}</div>
                  <div className="result-return">${totalReturn}</div>
                </div>
              ))}
            </div>

            <div className="profit-info">
              <p>
                {profit >= 0 
                  ? `✓ Each winning selection will return $${totalReturn} for a profit of $${profit}`
                  : `⚠️ Warning: Current odds will result in a loss of $${Math.abs(profit)}`
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DutchingCalculator;
