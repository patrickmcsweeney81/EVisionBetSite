import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

describe('Dashboard Component', () => {
  test('renders dashboard with username', () => {
    render(
      <MemoryRouter>
        <Dashboard username="testuser" onLogout={jest.fn()} />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/Welcome, testuser!/i)).toBeInTheDocument();
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  test('Expected Value Finder card is the first card in the grid', () => {
    render(
      <MemoryRouter>
        <Dashboard username="testuser" onLogout={jest.fn()} />
      </MemoryRouter>
    );
    
    // Get all dashboard cards
    const cards = screen.getAllByRole('heading', { level: 3 });
    
    // Verify Expected Value Finder is the first card
    expect(cards[0]).toHaveTextContent('📈 Expected Value Finder');
  });

  test('renders all dashboard cards in correct order', () => {
    render(
      <MemoryRouter>
        <Dashboard username="testuser" onLogout={jest.fn()} />
      </MemoryRouter>
    );
    
    // Get all dashboard cards
    const cards = screen.getAllByRole('heading', { level: 3 });
    
    // Verify the order
    expect(cards[0]).toHaveTextContent('📈 Expected Value Finder');
    expect(cards[1]).toHaveTextContent('🎯 Patty Picks');
    expect(cards[2]).toHaveTextContent('🧰 EV Toolbox');
    expect(cards[3]).toHaveTextContent('📊 All Odds Table');
    expect(cards[4]).toHaveTextContent('📋 Raw Odds Table');
    expect(cards[5]).toHaveTextContent('💡 Ideas & TODO');
    expect(cards[6]).toHaveTextContent('🩺 Diagnostics');
    expect(cards[7]).toHaveTextContent('⚙️ Settings');
  });

  test('Expected Value Finder card has correct link', () => {
    render(
      <MemoryRouter>
        <Dashboard username="testuser" onLogout={jest.fn()} />
      </MemoryRouter>
    );
    
    const evFinderLink = screen.getByRole('link', { name: /Open EV Finder/i });
    expect(evFinderLink).toHaveAttribute('href', '/ev');
  });
});
