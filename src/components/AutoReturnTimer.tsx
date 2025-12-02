/**
 * @fileoverview Компонент автоматического возврата на главный экран
 */

import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, autoReturnToMain } from '../store/gameStore';

interface AutoReturnTimerProps {
  /** Время неактивности в миллисекундах (по умолчанию 5 минут) */
  inactivityTimeout?: number;
}

export const AutoReturnTimer: React.FC<AutoReturnTimerProps> = ({
  inactivityTimeout = 5 * 60 * 1000 // 5 минут
}) => {
  const dispatch = useDispatch();
  const { currentStage } = useSelector((state: RootState) => state.game);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Не запускаем таймер на главном экране и экране выбора персонажа
    if (currentStage === 'intro' || currentStage === 'character') {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      dispatch(autoReturnToMain());
    }, inactivityTimeout);
  };

  useEffect(() => {
    const handleActivity = () => {
      resetTimer();
    };

    // События активности пользователя
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Инициализируем таймер
    resetTimer();

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentStage, inactivityTimeout, dispatch]);

  // Сбрасываем таймер при смене этапа
  useEffect(() => {
    resetTimer();
  }, [currentStage]);

  return null; // Компонент не рендерит ничего визуального
};