import React from 'react';
import { Menu, Leaf } from 'lucide-react';
import '../styles/components.css';

export default function Navbar({ onToggleSidebar }) {
  return (
    <header className="navbar-mobile">
      <div className="navbar-brand">
        <Leaf size={22} className="brand-icon-mobile" style={{ color: '#22c55e' }} />
        <span>EcoQuest</span>
      </div>

      <button className="menu-btn" onClick={onToggleSidebar} aria-label="Toggle Sidebar Menu">
        <Menu size={24} />
      </button>
    </header>
  );
}
