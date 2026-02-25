import { render, screen } from '@testing-library/react';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: false,
    json: () => Promise.resolve({}),
  })
);

beforeEach(() => {
  localStorage.clear();
});

test('renders app without crashing', () => {
  const { container } = render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
  expect(container).toBeTruthy();
});

test('shows login when not authenticated', async () => {
  render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );

  // Wait for auth check to complete (Login screen)
  await screen.findByRole('heading', { name: /sign in/i }, { timeout: 2000 });
  expect(screen.getAllByText(/sign in/i).length).toBeGreaterThan(0);
});