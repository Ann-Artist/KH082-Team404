import React from 'react';
import { Check } from 'lucide-react';
import '../styles/components.css';

export default function QuestStep({ steps, currentStepIndex }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', width: '100%' }}>
      {steps.map((step, idx) => {
        const isDone = idx < currentStepIndex;
        const isCurrent = idx === currentStepIndex;

        return (
          <React.Fragment key={idx}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  background: isDone
                    ? 'var(--emerald-500)'
                    : isCurrent
                    ? 'var(--dark-card-bg)'
                    : '#e2e8f0',
                  color: isDone || isCurrent ? '#ffffff' : '#64748b',
                  border: isCurrent ? '2px solid var(--emerald-500)' : 'none',
                  boxShadow: isCurrent ? '0 0 12px rgba(16, 185, 129, 0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}
              >
                {isDone ? <Check size={18} /> : idx + 1}
              </div>
              <span
                style={{
                  fontSize: '0.78rem',
                  fontWeight: isCurrent ? 700 : 500,
                  color: isCurrent ? 'var(--emerald-700)' : isDone ? '#0f172a' : '#94a3b8',
                  textAlign: 'center'
                }}
              >
                {step.title}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                style={{
                  height: '3px',
                  flex: 1,
                  background: idx < currentStepIndex ? 'var(--emerald-500)' : '#e2e8f0',
                  marginTop: '-1.25rem',
                  transition: 'all 0.3s ease'
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
