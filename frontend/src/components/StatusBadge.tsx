import React from 'react';
import { RequestStatus, WorkOrderStatus } from '../types';

interface StatusBadgeProps {
  status: RequestStatus | WorkOrderStatus | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status?.toLowerCase() || 'open';
  
  const getBadgeClass = () => {
    switch (normalized) {
      case 'open':
        return 'badge-open';
      case 'assigned':
        return 'badge-assigned';
      case 'in_progress':
        return 'badge-in_progress';
      case 'resolved':
      case 'completed':
        return 'badge-resolved';
      case 'on_hold':
      case 'cancelled':
      case 'closed':
        return 'badge-cancelled';
      default:
        return 'badge-open';
    }
  };

  const formatText = (text: string) => {
    return text.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {formatText(status || '')}
    </span>
  );
};
