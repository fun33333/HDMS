import React from 'react';
import { THEME } from '../../lib/theme';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  variant?: 'default' | 'elevated' | 'outlined';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  onClick, 
  style,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'shadow-md',
    elevated: 'shadow-lg hover:shadow-xl',
    outlined: 'shadow-sm border-2',
  };

  return (
    <div 
      className={`
        bg-white rounded-xl border transition-all duration-300 animate-fade-in
        ${variantStyles[variant]}
        ${onClick ? 'cursor-pointer hover:scale-[1.01] hover:shadow-xl' : ''} 
        ${className}
      `}
      style={{
        borderColor: variant === 'outlined' ? THEME.colors.medium : THEME.colors.medium + '30',
        ...style
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-5 border-b ${className}`} style={{ borderColor: THEME.colors.medium + '20' }}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-5 ${className}`}>
      {children}
    </div>
  );
};

interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-t ${className}`} style={{ borderColor: THEME.colors.medium + '20' }}>
      {children}
    </div>
  );
};

