import React from 'react';
import { playSound } from '../utils/soundUtils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'option' | 'correct' | 'wrong' | 'danger' | 'difficulty';
  fullWidth?: boolean;
  withSound?: boolean;
  soundEnabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  withSound = true,
  soundEnabled = true,
  onClick,
  ...props 
}) => {
  const baseStyles = "relative py-3 px-6 rounded-2xl font-bold transition-all transform active:scale-95 duration-100 shadow-[0_4px_0_0_rgba(0,0,0,0.1)] active:shadow-none active:translate-y-1 outline-none select-none";
  
  const variants = {
    primary: "bg-brand-blue text-teal-800 hover:bg-teal-200 hover:-translate-y-0.5 shadow-teal-300/50",
    secondary: "bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100",
    danger: "bg-red-100 text-red-600 hover:bg-red-200 border-2 border-red-200",
    option: "bg-white/80 backdrop-blur-sm hover:bg-brand-yellow/50 text-brand-text border-2 border-white hover:border-brand-yellow h-24 text-3xl shadow-lg hover:shadow-xl",
    correct: "bg-green-400 text-white border-green-500 shadow-green-600",
    wrong: "bg-red-400 text-white border-red-500 shadow-red-600",
    difficulty: "h-auto py-6 flex flex-col items-center justify-center gap-2 border-2"
  };

  // Extra specific styles for difficulty buttons
  const difficultyStyles = {
    EASY: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
    MEDIUM: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    HARD: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
    HELL: "bg-purple-900 border-purple-800 text-pink-300 hover:bg-purple-800",
  };

  const getVariantStyle = () => {
     if (variant === 'difficulty' && props['data-difficulty']) {
         // This is a hacky way to map specific difficulty styles, usually prefer props
         const diff = props['data-difficulty'] as string;
         // @ts-ignore
         return `${baseStyles} ${variants.difficulty} ${difficultyStyles[diff] || ''}`;
     }
     return `${baseStyles} ${variants[variant]}`;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (withSound && soundEnabled && !props.disabled) {
       playSound.click();
    }
    if (onClick) onClick(e);
  };

  return (
    <button 
      className={`${getVariantStyle()} ${fullWidth ? 'w-full' : ''} ${className}`}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};