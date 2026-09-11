import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Bike, Zap, Sprout, ChevronRight, Zap as XPPoint } from 'lucide-react';
import VerificationStatus from './VerificationStatus';
import '../styles/components.css';

const questIcons = {
  public_transport: Bus,
  cycling: Bike,
  electricity: Zap,
  plant_care: Sprout
};

export default function ActivityCard({ submission }) {
  const navigate = useNavigate();
  const Icon = questIcons[submission.quest_key] || Sprout;

  const dateStr = new Date(submission.created_at || Date.now()).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div
      className="eco-card"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 1.25rem',
        cursor: 'pointer'
      }}
      onClick={() => navigate(`/activity/${submission.id}`)}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'var(--emerald-50)',
            color: 'var(--emerald-600)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={22} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '1rem', color: '#0f172a', fontWeight: 700 }}>
              {submission.quest_name}
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
              Attempt #{submission.attempt_number || 1}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.2rem' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{dateStr}</span>
            <VerificationStatus status={submission.verification_status} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {submission.verification_status === 'VERIFIED' && (
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontWeight: 800, color: 'var(--emerald-600)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <XPPoint size={15} fill="#10b981" /> +{submission.reward_points} EcoXP
            </span>
          </div>
        )}
        <ChevronRight size={20} style={{ color: '#cbd5e1' }} />
      </div>
    </div>
  );
}
