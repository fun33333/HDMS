import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12', 
    lg: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      {/* Your Image Logo */}
      <img 
        src="/al khair.png" 
        alt="Help Desk Logo"
        className="object-contain"
        style={{ 
          width: size === 'sm' ? '40px' : size === 'md' ? '50px' : '60px',
          height: size === 'sm' ? '40px' : size === 'md' ? '50px' : '60px'
        }}
      />
    </div>
  );
};

