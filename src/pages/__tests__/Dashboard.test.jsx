import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';

// Mock the SocketContext
vi.mock('../../context/SocketContext', () => ({
  useSocket: () => ({
    connected: true,
    actionLogs: []
  })
}));

// Mock fetch API
global.fetch = vi.fn();

describe('Dashboard Page', () => {
  beforeEach(() => {
    fetch.mockClear();
    fetch.mockResolvedValue({
      json: async () => ({ status: 'healthy' })
    });
  });

  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Dashboard heading should be present
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('should display feature cards', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    // Check for main feature sections
    expect(screen.getByText(/Total Actions/i)).toBeInTheDocument();
  });

  it('should call health check API on mount', () => {
    render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
    
    expect(fetch).toHaveBeenCalledWith('/api/health');
  });
});
