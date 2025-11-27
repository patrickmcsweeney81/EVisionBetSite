import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/client';
import './TodoPage.css';

function TodoPage({ username, onLogout }) {
  const [todoContent, setTodoContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTodoContent();
  }, []);

  const fetchTodoContent = async () => {
    try {
      const response = await apiFetch('/api/todo', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setTodoContent(data.content);
      } else {
        setError('Failed to load TODO content');
      }
    } catch (err) {
      setError('Network error. Please make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  const renderMarkdown = (content) => {
    // Simple markdown renderer for basic formatting
    return content.split('\n').map((line, index) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={index}>{line.substring(2)}</h1>;
      } else if (line.startsWith('## ')) {
        return <h2 key={index}>{line.substring(3)}</h2>;
      } else if (line.startsWith('### ')) {
        return <h3 key={index}>{line.substring(4)}</h3>;
      }
      // Checkboxes
      else if (line.includes('- [x]')) {
        return (
          <div key={index} className="checkbox-item completed">
            ✓ {line.replace('- [x]', '')}
          </div>
        );
      } else if (line.includes('- [ ]')) {
        return (
          <div key={index} className="checkbox-item">
            ☐ {line.replace('- [ ]', '')}
          </div>
        );
      }
      // Lists
      else if (line.startsWith('- ')) {
        return <li key={index}>{line.substring(2)}</li>;
      }
      // Empty lines
      else if (line.trim() === '') {
        return <br key={index} />;
      }
      // Regular paragraphs
      else {
        return <p key={index}>{line}</p>;
      }
    });
  };

  return (
    <div className="todo-container">
      <nav className="todo-nav">
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

      <div className="todo-content">
        <div className="breadcrumb">
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>

        <h1>Ideas & TODO</h1>

        {loading && <div className="loading">Loading...</div>}
        {error && <div className="error-message">{error}</div>}
        
        {!loading && !error && (
          <div className="markdown-content">
            {renderMarkdown(todoContent)}
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoPage;