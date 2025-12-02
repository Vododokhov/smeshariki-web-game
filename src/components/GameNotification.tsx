/**
 * @fileoverview Компонент всплывающих уведомлений для игр
 */

import React from 'react';
import { Modal } from './ui/modal';
import { GameButton } from './GameButton';
import { Trophy, RotateCcw, Play, AlertCircle } from 'lucide-react';

interface GameNotificationProps {
  isVisible: boolean;
  type: 'success' | 'failure' | 'timeout';
  title: string;
  message: string;
  score?: number;
  onContinue?: () => void;
  onRestart?: () => void;
  onClose?: () => void;
  onSkip?: () => void;
  showContinueButton?: boolean;
  showRestartButton?: boolean;
  showSkipButton?: boolean;
}

export const GameNotification: React.FC<GameNotificationProps> = ({
  isVisible,
  type,
  title,
  message,
  score,
  onContinue,
  onRestart,
  onClose,
  onSkip,
  showContinueButton = true,
  showRestartButton = true,
  showSkipButton = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Trophy className="text-green-600" size={48} />;
      case 'failure':
        return <AlertCircle className="text-red-600" size={48} />;
      case 'timeout':
        return <AlertCircle className="text-orange-600" size={48} />;
      default:
        return <Trophy className="text-blue-600" size={48} />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 border-green-300';
      case 'failure':
        return 'bg-red-100 border-red-300';
      case 'timeout':
        return 'bg-orange-100 border-orange-300';
      default:
        return 'bg-blue-100 border-blue-300';
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'failure':
        return 'text-red-800';
      case 'timeout':
        return 'text-orange-800';
      default:
        return 'text-blue-800';
    }
  };

  return (
    <Modal isOpen={isVisible} onClose={onClose || (() => {})}>
      <div className={`${getBgColor()} border-2 rounded-2xl p-6 text-center animate-in slide-in-from-top-4 duration-500`}>
        <div className="flex items-center justify-center mb-4 animate-in zoom-in-50 duration-700">
          {getIcon()}
        </div>
        
        <h3 className={`text-2xl font-bold ${getTextColor()} mb-3`}>
          {title}
        </h3>
        
        <p className={`${getTextColor()} mb-4`}>
          {message}
        </p>
        
        {score !== undefined && (
          <p className={`${getTextColor()} font-bold text-lg mb-4`}>
            Очки: {score}
          </p>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {showContinueButton && onContinue && (
            <GameButton
              onClick={onContinue}
              variant={type === 'success' ? 'success' : 'primary'}
              size="medium"
              className="px-6"
            >
              <div className="flex items-center gap-2">
                <Play size={16} />
                {type === 'success' ? 'Продолжить' : 'Попробовать еще'}
              </div>
            </GameButton>
          )}
          
          {showSkipButton && onSkip && (
            <GameButton
              onClick={onSkip}
              variant="primary"
              size="medium"
              className="px-6"
            >
              <div className="flex items-center gap-2">
                <Play size={16} />
                Пропустить
              </div>
            </GameButton>
          )}
          
          {showRestartButton && onRestart && (
            <GameButton
              onClick={onRestart}
              variant="secondary"
              size="medium"
              className="px-6"
            >
              <div className="flex items-center gap-2">
                <RotateCcw size={16} />
                Заново
              </div>
            </GameButton>
          )}
        </div>
      </div>
    </Modal>
  );
};