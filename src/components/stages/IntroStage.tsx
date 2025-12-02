/**
 * @fileoverview Компонент вступительного экрана игры
 * Показывает заставку с анимацией и кнопкой начала игры
 */

import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { nextStage } from '../../store/gameStore';
import { GameButton } from '../GameButton';
import { Sparkles} from 'lucide-react';

// Импорт фонового изображения
import mainBgImg from '../../assets/backgrounds/main-bg.jpg';

/**
 * Вступительный экран игры
 * Содержит анимированную заставку и приветствие
 */
export const IntroStage: React.FC = () => {
  const dispatch = useDispatch();
  const [showButton, setShowButton] = useState(false);

  // Показываем кнопку через 2 секунды для эффекта
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  /**
   * Обработка начала игры
   */
  const handleStartGame = () => {
    dispatch(nextStage());
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center p-8 relative overflow-hidden"
      style={{
        backgroundImage: `url(${mainBgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Затемненный оверлей для читаемости текста */}
      <div className="absolute inset-0 bg-black/20"></div>     

      {/* Основной контент */}
      <div className="text-center z-10 max-w-4xl">
        {/* Заголовок игры */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
              МИР ПРИКЛЮЧЕНИЙ
            </span>
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-orange-400 via-yellow-500 to-green-500 bg-clip-text text-transparent">
              СМЕШАРИКОВ
            </span>
          </h2>
        </div>

        {/* Описание игры */}
        <div className="mb-8 p-6 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-white/50 animate-fade-in">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="text-pink-500 mr-2" size={24} />
            <span className="text-xl font-semibold text-gray-700">Добро пожаловать в удивительную игру!</span>
            <Sparkles className="text-blue-500 ml-2" size={24} />
          </div>
          
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            Выбери своего любимого персонажа Смешариков и отправляйся в увлекательное путешествие! 
          </p>
          
          <p className="text-base text-gray-500">
            Тебя ждут 8 захватывающих этапов с логическими задачами, музыкальными играми и веселыми приключениями!
          </p>
        </div>

        {/* Кнопка начала игры */}
        {showButton && (
          <div className="animate-scale-in">
            <GameButton
              onClick={handleStartGame}
              variant="primary"
              size="large"
              pulse={false}
              className="text-2xl px-12 py-6 shadow-2xl"
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="w-8 h-8" />
                <span>НАЧАТЬ ИГРУ</span>
                <Sparkles className="w-8 h-8" />
              </div>
            </GameButton>
          </div>
        )}
      </div>      
    </div>
  );
};