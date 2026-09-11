import React from 'react';
import { CheckCircle2, AlertOctagon, XCircle, RefreshCw } from 'lucide-react';
import '../styles/components.css';

export default function VerificationStatus({ status }) {
  let badgeClass = 'pill-blue';
  let Icon = RefreshCw;
  let label = status || 'PENDING';

  switch (status) {
    case 'VERIFIED':
      badgeClass = 'pill-emerald';
      Icon = CheckCircle2;
      label = 'Verified Eco Action';
      break;
    case 'SUSPICIOUS':
      badgeClass = 'pill-orange';
      Icon = AlertOctagon;
      label = 'Needs Review';
      break;
    case 'REJECTED':
      badgeClass = 'pill-orange';
      Icon = XCircle;
      label = 'Submission Rejected';
      break;
    case 'VERIFYING':
      badgeClass = 'pill-blue';
      Icon = RefreshCw;
      label = 'Verifying...';
      break;
  }

  return (
    <span className={`pill-badge ${badgeClass}`}>
      <Icon size={14} className={status === 'VERIFYING' ? 'animate-spin' : ''} />
      <span>{label}</span>
    </span>
  );
}
