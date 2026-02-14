import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  padding = 'md',
  hover = false 
}: CardProps) {
  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const variantStyles = {
    default: 'bg-white shadow-lg border border-[var(--color-card)]',
    gradient: 'gradient-card shadow-lg border border-[var(--color-card)]',
    glass: 'glass border border-white/50 shadow-lg',
  };

  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover 
    ? 'hover:shadow-xl hover:scale-[1.02] cursor-pointer' 
    : '';

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`}>
      {children}
    </div>
  );
}
