import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';

// Mock the SocketContext
vi.mock('../../context/SocketContext', () => ({
  useSocket: () => ({
    connected: true,
    actionLogs: []
  })
}));

describe('Header Component', () => {
  it('should render without crashing', () => {
    render(
      <BrowserRouter>
        <Header toggleSidebar={() => {}} sidebarOpen={false} />
      </BrowserRouter>
    );
    
    // Header should be rendered
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('should display menu button', () => {
    render(
      <BrowserRouter>
        <Header toggleSidebar={() => {}} sidebarOpen={false} />
      </BrowserRouter>
    );
    
    const menuButton = screen.getByRole('button');
    expect(menuButton).toBeInTheDocument();
  });

  it('should call toggleSidebar when menu button is clicked', () => {
    const toggleSidebar = vi.fn();
    
    render(
      <BrowserRouter>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={false} />
      </BrowserRouter>
    );
    
    const menuButton = screen.getByRole('button');
    menuButton.click();
    
    expect(toggleSidebar).toHaveBeenCalledTimes(1);
  });
});
