/**
 * @fileoverview Универсальная игровая кнопка с анимациями
 * Используется во всех частях игры для единообразного стиля
 */

import React from 'react';

interface GameButtonProps {
  /** Текст кнопки */
  children: React.ReactNode;
  /** Функция обработки клика */
  onClick: () => void;
  /** Вариант стиля кнопки */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  /** Размер кнопки */
  size?: 'small' | 'medium' | 'large';
  /** Отключена ли кнопка */
  disabled?: boolean;
  /** Дополнительные CSS классы */
  className?: string;
  /** Показать анимацию пульсации */
  pulse?: boolean;
}

/**
 * Универсальная игровая кнопка
 * Адаптирована для детской аудитории с яркими цветами и анимациями
 */
export const GameButton: React.FC<GameButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  className = '',
  pulse = false
}) => {
  // Определяем стили для разных вариантов
  const variantStyles = {
    primary: 'bg-gradient-to-r from-pink-400 to-purple-500 text-white border-pink-300',
    secondary: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-blue-300',
    success: 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300',
    warning: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300',
    danger: 'bg-gradient-to-r from-red-400 to-pink-500 text-white border-red-300'
  };

  // Определяем размеры
  const sizeStyles = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        game-button
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        font-bold rounded-2xl border-2
        transition-all duration-300 ease-out
        transform active:scale-95
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:scale-110 hover:shadow-2xl'
        }
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
      style={{
        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        boxShadow: disabled 
          ? 'none' 
          : '0 8px 32px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
      }}
    >
      {children}
    </button>
  );
};