import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function DiagnosticPage() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const diagnostics = {
      envVar: process.env.REACT_APP_API_URL,
      apiUrl: API_URL,
      nodeEnv: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Root endpoint
    try {
      const response = await fetch(`${API_URL}/`);
      diagnostics.tests.root = {
        status: response.status,
        ok: response.ok,
        data: await response.json()
      };
    } catch (err) {
      diagnostics.tests.root = { error: err.message };
    }

    // Test 2: Health endpoint
    try {
      const response = await fetch(`${API_URL}/health`);
      diagnostics.tests.health = {
        status: response.status,
        ok: response.ok,
        data: await response.json()
      };
    } catch (err) {
      diagnostics.tests.health = { error: err.message };
    }

    // Test 3: Config endpoint
    try {
      const response = await fetch(`${API_URL}/api/odds/config`);
      diagnostics.tests.config = {
        status: response.status,
        ok: response.ok,
        data: await response.json()
      };
    } catch (err) {
      diagnostics.tests.config = { error: err.message };
    }

    // Test 4: Sports endpoint
    try {
      const response = await fetch(`${API_URL}/api/odds/sports`);
      const data = await response.json();
      diagnostics.tests.sports = {
        status: response.status,
        ok: response.ok,
        count: data.length,
        firstThree: data.slice(0, 3)
      };
    } catch (err) {
      diagnostics.tests.sports = { error: err.message };
    }

    setResults(diagnostics);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Running Diagnostics...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace', backgroundColor: '#1a1a1a', color: '#0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#0f0' }}>🔧 EVisionBet API Diagnostics</h1>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '5px' }}>
        <h2>Environment Configuration</h2>
        <p><strong>REACT_APP_API_URL:</strong> {results.envVar || 'NOT SET'}</p>
        <p><strong>Resolved API_URL:</strong> {results.apiUrl}</p>
        <p><strong>NODE_ENV:</strong> {results.nodeEnv}</p>
        <p><strong>Timestamp:</strong> {results.timestamp}</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <h2>API Endpoint Tests</h2>
        
        {Object.entries(results.tests).map(([name, result]) => (
          <div key={name} style={{ 
            marginTop: '15px', 
            padding: '15px', 
            backgroundColor: result.error ? '#4a0000' : '#004a00',
            borderRadius: '5px',
            border: result.error ? '2px solid #f00' : '2px solid #0f0'
          }}>
            <h3>{name.toUpperCase()}</h3>
            {result.error ? (
              <p style={{ color: '#ff0000' }}>❌ ERROR: {result.error}</p>
            ) : (
              <>
                <p>✅ Status: {result.status}</p>
                <p>✅ OK: {result.ok ? 'Yes' : 'No'}</p>
                {result.count && <p>✅ Count: {result.count}</p>}
                <details>
                  <summary style={{ cursor: 'pointer', marginTop: '10px' }}>View Data</summary>
                  <pre style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    backgroundColor: '#1a1a1a', 
                    borderRadius: '3px',
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}>
                    {JSON.stringify(result.data || result.firstThree, null, 2)}
                  </pre>
                </details>
              </>
            )}
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '5px' }}>
        <h2>Next Steps</h2>
        <ul>
          <li>If all tests show ✅, the API connection is working</li>
          <li>If tests show ❌ with CORS errors, check backend CORS settings</li>
          <li>If tests show ❌ with "Failed to fetch", check if backend URL is correct</li>
          <li>If REACT_APP_API_URL is "NOT SET", environment variable not configured in build</li>
        </ul>
      </div>

      <button 
        onClick={runDiagnostics}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#0f0',
          color: '#000',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
      >
        🔄 Rerun Diagnostics
      </button>
    </div>
  );
}

export default DiagnosticPage;
