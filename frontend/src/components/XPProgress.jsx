import React from 'react';
import { Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import '../styles/components.css';

export default function XPProgress({ progression }) {
  const level = progression?.level || {
    level_number: 1,
    title: 'Eco Starter',
    totalXP: 0,
    progressPercent: 0,
    xpRequiredForNext: 100
  };

  return (
    <div className="eco-card-dark animate-fade-in" style={{ position: 'relative', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981, #22c55e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 15px rgba(34, 197, 94, 0.4)'
            }}
          >
            <ShieldCheck size={26} />
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>
              Current Rank
            </span>
            <h3 style={{ fontSize: '1.35rem', color: '#ffffff', lineHeight: 1.2 }}>
              Level {level.level_number} — {level.title}
            </h3>
          </div>
        </div>

        <div
          style={{
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#22c55e',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 700,
            fontSize: '0.95rem'
          }}
        >
          <Zap size={18} fill="#22c55e" />
          <span>{level.totalXP} EcoXP</span>
        </div>
      </div>

      <div style={{ marginTop: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
          <span>Level {level.level_number} Progress</span>
          <span>{level.progressPercent}% ({level.xpRequiredForNext} XP to next level)</span>
        </div>

        <div className="progress-bar-container" style={{ height: '12px', background: 'rgba(255,255,255,0.1)' }}>
          <div className="progress-bar-fill" style={{ width: `${level.progressPercent}%` }} />
        </div>
      </div>
    </div>
  );
}
