/**
 * @fileoverview Компонент панели счета и статистики игры
 * Отображает очки, собранные награды, жизни и время
 */

import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/gameStore';
import { Heart, Star, Trophy, Clock } from 'lucide-react';

/**
 * Панель счета игры
 * Показывает текущий прогресс и статистику игрока
 */
export const ScoreBoard: React.FC = () => {
  const { score, collectedRewards, lives, gameTime } = useSelector(
    (state: RootState) => state.game
  );

  /**
   * Форматирует время в минуты и секунды
   */
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border-2 border-white/50">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Очки */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
            <Star className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Очки</p>
            <p className="text-lg font-bold text-gray-800">{score.toLocaleString()}</p>
          </div>
        </div>

        {/* Награды */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Награды</p>
            <p className="text-lg font-bold text-gray-800">{collectedRewards}</p>
          </div>
        </div>

        {/* Жизни */}
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            {Array.from({ length: 3 }, (_, i) => (
              <Heart
                key={i}
                className={`w-6 h-6 ${
                  i < lives 
                    ? 'text-red-500 fill-current' 
                    : 'text-gray-300'
                } transition-colors duration-300`}
              />
            ))}
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Жизни</p>
            <p className="text-lg font-bold text-gray-800">{lives}</p>
          </div>
        </div>

        {/* Время */}
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-gray-600 font-medium">Время</p>
            <p className="text-lg font-bold text-gray-800">{formatTime(gameTime)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};