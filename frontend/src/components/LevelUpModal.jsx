import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import '../styles/components.css';

export default function LevelUpModal({ levelInfo, onClose }) {
  if (!levelInfo) return null;

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-card">
        <div className="victory-icon-circle glow-pulse" style={{ background: 'linear-gradient(135deg, #f59e0b, #eab308)' }}>
          <Sparkles size={46} />
        </div>

        <span style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          LEVEL UP!
        </span>

        <h2 style={{ fontSize: '2rem', color: '#0f172a', margin: '0.3rem 0 0.5rem 0' }}>
          Level {levelInfo.level_number}
        </h2>

        <div style={{ background: 'var(--emerald-50)', border: '1px solid var(--emerald-200)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--emerald-800)', fontWeight: 600, display: 'block' }}>
            NEW TITLE UNLOCKED
          </span>
          <span style={{ fontSize: '1.25rem', color: 'var(--emerald-700)', fontWeight: 800 }}>
            {levelInfo.title}
          </span>
        </div>

        <button className="btn-emerald" style={{ width: '100%' }} onClick={onClose}>
          Claim Title & Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
