interface BadgeProps {
  status: 'at-risk' | 'not-at-risk' | 'pending';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Badge({ status, size = 'md', className = '' }: BadgeProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-full';
  
  const statusStyles = {
    'at-risk': 'bg-red-100 text-red-700 border border-red-200',
    'not-at-risk': 'bg-green-100 text-green-700 border border-green-200',
    'pending': 'bg-[var(--color-card)] text-[var(--color-text-light)] border border-[var(--color-muted)]',
  };

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const statusLabels = {
    'at-risk': '⚠️ At Risk',
    'not-at-risk': '✓ Not At Risk',
    'pending': '⏳ Pending',
  };

  return (
    <span className={`${baseStyles} ${statusStyles[status]} ${sizeStyles[size]} ${className}`}>
      {statusLabels[status]}
    </span>
  );
}
