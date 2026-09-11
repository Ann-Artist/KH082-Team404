import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Swords,
  History,
  TrendingUp,
  Award,
  User,
  Settings,
  Leaf,
  Zap,
  Flame
} from 'lucide-react';
import '../styles/components.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/quests', label: 'Quests', icon: Swords },
  { path: '/activity', label: 'Activity History', icon: History },
  { path: '/impact', label: 'Impact Tracker', icon: TrendingUp },
  { path: '/rewards', label: 'Rewards & Badges', icon: Award },
  { path: '/profile', label: 'My Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings }
];

export default function Sidebar({ user, progression, isOpen, onClose }) {
  const avatarId = user?.avatar_id || 'eco';
  const avatarPath = `/src/assets/avatars/${avatarId}.png`;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="brand-logo-glow">
            <Leaf className="brand-icon" size={26} />
          </div>
          <div className="brand-text">
            <span className="brand-title">EcoQuest</span>
            <span className="brand-tag">Sustainability Game</span>
          </div>
        </div>

        {/* User Mini Card */}
        {user && (
          <div className="sidebar-user-card">
            <div className="user-avatar-wrapper">
              <img
                src={avatarPath}
                alt={user.name}
                className="sidebar-avatar-img"
                onError={(e) => {
                  e.target.src = '/src/assets/avatars/eco.png';
                }}
              />
              <span className="online-indicator" />
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-title-badge">
                {progression?.level?.title || 'Eco Starter'}
              </span>
            </div>
          </div>
        )}

        {/* Quick Stats Widget */}
        {progression && (
          <div className="sidebar-stats-bar">
            <div className="mini-stat">
              <Zap size={14} className="stat-icon xp" />
              <span>{progression.totalXP || 0} XP</span>
            </div>
            <div className="mini-stat">
              <Flame size={14} className="stat-icon streak" />
              <span>{progression.streak?.current_streak || 0}d Streak</span>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={20} className="nav-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <span className="version-tag">EcoQuest Prototype v1.0</span>
        </div>
      </aside>
    </>
  );
}
