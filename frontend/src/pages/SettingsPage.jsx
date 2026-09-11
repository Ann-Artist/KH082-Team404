import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Moon, Bell, Database, Trash2, LogOut } from 'lucide-react';
import '../styles/index.css';

export default function SettingsPage({ onResetSession }) {
  const navigate = useNavigate();

  const handleResetProfileSession = () => {
    if (window.confirm('Are you sure you want to log out and create a new profile?')) {
      localStorage.removeItem('ecoquest_user_id');
      if (onResetSession) onResetSession();
      navigate('/setup');
    }
  };

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Settings size={18} /> Preferences
        </div>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Application Settings</h1>
      </div>

      <div className="eco-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Moon size={18} style={{ color: 'var(--emerald-600)' }} /> Visual Theme
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8faf8', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem', display: 'block' }}>Eco Dark Sidebar + Clean Slate Dashboard</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Modern green dashboard palette matching design specification</span>
            </div>
            <span className="pill-badge pill-emerald">Active Theme</span>
          </div>
        </div>

        <div>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Bell size={18} style={{ color: '#f59e0b' }} /> Quest Reminder Notifications
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8faf8', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0' }}>
            <div>
              <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.92rem', display: 'block' }}>Daily Streak & Cooldown Alerts</span>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Receive alerts when quest cooldown windows expire</span>
            </div>
            <span className="pill-badge pill-blue">Enabled</span>
          </div>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <h3 style={{ fontSize: '1.1rem', color: '#0f172a', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Database size={18} style={{ color: '#ef4444' }} /> Demo Account Control
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
            Log out or reset your local profile session to create a new profile account.
          </p>

          <button className="btn-secondary" style={{ color: '#ef4444', borderColor: '#fecaca' }} onClick={handleResetProfileSession}>
            <LogOut size={16} /> Log Out / Switch Account
          </button>
        </div>
      </div>
    </div>
  );
}
