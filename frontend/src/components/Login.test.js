import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

// Mock navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock fetch
global.fetch = jest.fn();

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login form', () => {
    render(
      <BrowserRouter>
        <Login onLogin={jest.fn()} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
  });

  test('shows hint with correct username', () => {
    render(
      <BrowserRouter>
        <Login onLogin={jest.fn()} />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/EVision/i)).toBeInTheDocument();
  });

  test('allows input in username and password fields', () => {
    render(
      <BrowserRouter>
        <Login onLogin={jest.fn()} />
      </BrowserRouter>
    );
    
    const usernameInput = screen.getByPlaceholderText(/Enter your username/i);
    const passwordInput = screen.getByPlaceholderText(/Enter your password/i);
    
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'testpass' } });
    
    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('testpass');
  });
});
