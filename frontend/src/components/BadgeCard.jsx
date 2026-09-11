import React from 'react';
import { Award, Sparkles, Bike, Bus, Sprout, Zap, Flame, Shield, Lock } from 'lucide-react';
import '../styles/components.css';

const badgeIcons = {
  sparkles: Sparkles,
  bike: Bike,
  bus: Bus,
  sprout: Sprout,
  zap: Zap,
  flame: Flame,
  award: Award,
  shield: Shield
};

export default function BadgeCard({ badge }) {
  const Icon = badgeIcons[badge.icon] || Award;
  const isUnlocked = badge.unlocked;

  return (
    <div
      className="eco-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        padding: '1.25rem',
        opacity: isUnlocked ? 1 : 0.65,
        background: isUnlocked ? 'var(--card-bg)' : '#f8faf8',
        borderColor: isUnlocked ? 'var(--emerald-200)' : 'var(--card-border)',
        position: 'relative'
      }}
    >
      {!isUnlocked && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#94a3b8' }}>
          <Lock size={16} />
        </div>
      )}

      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isUnlocked
            ? 'linear-gradient(135deg, var(--emerald-500), var(--emerald-neon))'
            : '#e2e8f0',
          color: isUnlocked ? '#ffffff' : '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '0.85rem',
          boxShadow: isUnlocked ? '0 0 15px rgba(34, 197, 94, 0.35)' : 'none'
        }}
      >
        <Icon size={26} />
      </div>

      <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 700, marginBottom: '0.25rem' }}>
        {badge.name}
      </h4>

      <p style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.3, marginBottom: '0.75rem' }}>
        {badge.description}
      </p>

      {isUnlocked ? (
        <span className="pill-badge pill-emerald" style={{ fontSize: '0.72rem' }}>
          Unlocked
        </span>
      ) : (
        <span className="pill-badge" style={{ fontSize: '0.72rem', background: '#e2e8f0', color: '#64748b' }}>
          Locked
        </span>
      )}
    </div>
  );
}
