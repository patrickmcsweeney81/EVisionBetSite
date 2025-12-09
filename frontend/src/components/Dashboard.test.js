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

  test('EV Hits card is the first card in the grid', () => {
    render(
      <MemoryRouter>
        <Dashboard username="testuser" onLogout={jest.fn()} />
      </MemoryRouter>
    );
    
    // Get all dashboard cards
    const cards = screen.getAllByRole('heading', { level: 3 });
    
    // Verify EV Hits is the first card
    expect(cards[0]).toHaveTextContent('📈 EV Hits');
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
    expect(cards[0]).toHaveTextContent('📈 EV Hits');
    expect(cards[1]).toHaveTextContent('📊 Analytics');
    expect(cards[2]).toHaveTextContent('🎯 Live Odds');
    expect(cards[3]).toHaveTextContent('📊 All Odds Table');
    expect(cards[4]).toHaveTextContent('💡 Ideas & TODO');
    expect(cards[5]).toHaveTextContent('⚙️ Settings');
  });

  test('EV Hits card has correct link', () => {
    render(
      <MemoryRouter>
        <Dashboard username="testuser" onLogout={jest.fn()} />
      </MemoryRouter>
    );
    
    const evHitsLink = screen.getByRole('link', { name: /View EV Hits/i });
    expect(evHitsLink).toHaveAttribute('href', '/ev');
  });
});
