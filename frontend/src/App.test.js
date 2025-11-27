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
  
  // Wait for auth check to complete
  await screen.findByText(/Welcome Back/i, {}, { timeout: 2000 });
  expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
});