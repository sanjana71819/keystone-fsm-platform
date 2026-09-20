import React from 'react';
import { Priority } from '../types';

interface PriorityBadgeProps {
  priority: Priority | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const normalized = priority?.toLowerCase() || 'medium';

  const getBadgeClass = () => {
    switch (normalized) {
      case 'critical':
        return 'badge-critical';
      case 'high':
        return 'badge-high';
      case 'medium':
        return 'badge-medium';
      case 'low':
        return 'badge-low';
      default:
        return 'badge-medium';
    }
  };

  return (
    <span className={`badge ${getBadgeClass()}`}>
      {priority?.toUpperCase()}
    </span>
  );
};
