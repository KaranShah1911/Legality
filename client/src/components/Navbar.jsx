import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useTheme } from '../context/ThemeContext';
import { Shield, Menu, X, Sun, Moon } from 'lucide-react';

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/create-contract', label: 'Create' },
  { to: '/verify', label: 'Verify' },
];

const Navbar = () => {
  const { pathname } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl transition-colors duration-300"
      style={{ background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)', boxShadow: '0 4px 16px rgba(99,102,241,0.35)' }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold font-display" style={{ color: 'var(--text-heading)' }}>
            Legality
          </span>
          <span className="hidden sm:inline text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(99,102,241,0.12)', color: '#6366f1' }}>
            BETA
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => {
            const isActive = pathname === link.to;
            return (
              <Link key={link.to} to={link.to}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                style={{
                  color: isActive ? '#6366f1' : 'var(--text-secondary)',
                  background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent'
                }}>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button onClick={toggleTheme}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: 'var(--bg-glass-sm)',
              border: '1px solid var(--border-glass-sm)',
            }}
            aria-label="Toggle theme">
            {theme === 'dark'
              ? <Sun className="w-4 h-4" style={{ color: '#fbbf24' }} />
              : <Moon className="w-4 h-4" style={{ color: '#6366f1' }} />
            }
          </button>

          <div className="hidden md:block">
            <ConnectButton chainStatus="icon" showBalance={false} />
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileOpen(!mobileOpen)}
            style={{ color: 'var(--text-secondary)' }}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-1 border-t transition-colors"
          style={{ borderColor: 'var(--nav-border)' }}>
          {NAV_LINKS.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: pathname === link.to ? '#6366f1' : 'var(--text-secondary)',
                background: pathname === link.to ? 'rgba(99,102,241,0.1)' : 'transparent'
              }}>
              {link.label}
            </Link>
          ))}
          <div className="pt-2">
            <ConnectButton chainStatus="icon" showBalance={false} />
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
