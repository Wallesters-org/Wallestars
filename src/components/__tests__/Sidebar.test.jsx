import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from '../Sidebar';

// Mock the SocketContext
vi.mock('../../context/SocketContext', () => ({
  useSocket: () => ({
    connected: true
  })
}));

describe('Sidebar Component', () => {
  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <Sidebar isOpen={true} />
      </BrowserRouter>
    );
    
    // Check for navigation links
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('should display navigation links', () => {
    render(
      <BrowserRouter>
        <Sidebar isOpen={true} />
      </BrowserRouter>
    );
    
    // Check for main navigation items
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Claude Chat/i)).toBeInTheDocument();
  });
});
