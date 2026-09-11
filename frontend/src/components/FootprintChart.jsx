import React from 'react';
import { Bus, Zap, Utensils, ShoppingBag, Trash2 } from 'lucide-react';
import '../styles/components.css';

const categoryIcons = {
  transport: Bus,
  electricity: Zap,
  food: Utensils,
  shopping: ShoppingBag,
  waste: Trash2
};

const categoryColors = {
  transport: '#0284c7',
  electricity: '#f59e0b',
  food: '#10b981',
  shopping: '#8b5cf6',
  waste: '#64748b'
};

export default function FootprintChart({ footprint }) {
  if (!footprint) return null;

  const {
    transport_emission = 0,
    electricity_emission = 0,
    food_emission = 0,
    shopping_emission = 0,
    waste_emission = 0,
    total_emission = 1
  } = footprint;

  const items = [
    { label: 'Transportation', value: transport_emission, key: 'transport' },
    { label: 'Electricity / Energy', value: electricity_emission, key: 'electricity' },
    { label: 'Food & Diet', value: food_emission, key: 'food' },
    { label: 'Shopping & Goods', value: shopping_emission, key: 'shopping' },
    { label: 'Waste Generation', value: waste_emission, key: 'waste' }
  ];

  return (
    <div className="eco-card animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Baseline Carbon Footprint
          </span>
          <h3 style={{ fontSize: '1.25rem', color: '#0f172a' }}>Monthly Emission Breakdown</h3>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', display: 'block', lineHeight: 1.1 }}>
            {total_emission} <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>kg CO2e / mo</span>
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {items.map((item) => {
          const Icon = categoryIcons[item.key] || Bus;
          const color = categoryColors[item.key] || '#10b981';
          const percent = total_emission > 0 ? Math.round((item.value / total_emission) * 100) : 0;

          return (
            <div key={item.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155' }}>
                  <Icon size={16} style={{ color }} />
                  <span>{item.label}</span>
                </div>
                <div style={{ color: '#0f172a' }}>
                  <span>{item.value} kg</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.78rem', marginLeft: '0.4rem' }}>({percent}%)</span>
                </div>
              </div>

              <div className="progress-bar-container" style={{ height: '8px' }}>
                <div
                  className="progress-bar-fill"
                  style={{ width: `${percent}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
