/**
 * @fileoverview Компонент карточки персонажа для выбора в игре
 * Отображает персонажа с анимацией и интерактивными эффектами
 */

import React from 'react';
import { Character, CharacterInfo } from '../store/gameStore';

interface CharacterCardProps {
  /** Информация о персонаже */
  character: CharacterInfo;
  /** Выбран ли персонаж */
  isSelected: boolean;
  /** Функция обработки клика по карточке */
  onClick: (character: Character) => void;
  /** Путь к изображению персонажа */
  imageSrc: string;
}

/**
 * Компонент карточки персонажа
 * Показывает изображение, имя и описание персонажа с анимациями
 */
export const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  isSelected,
  onClick,
  imageSrc
}) => {
  return (
    <div
      className={`
        character-card
        p-4 rounded-2xl bg-white/90 backdrop-blur-sm
        border-4 transition-all duration-300
        ${isSelected 
          ? 'border-yellow-400 scale-105 animate-glow' 
          : 'border-transparent hover:border-white/50'
        }
        ${isSelected ? 'animate-bounce-character' : 'hover:animate-float'}
      `}
      onClick={() => onClick(character.id)}
      style={{
        boxShadow: isSelected 
          ? '0 0 30px rgba(251, 191, 36, 0.6)' 
          : '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Изображение персонажа */}
      <div className="relative mb-3">
        <img
          src={imageSrc}
          alt={character.name}
          className="w-20 h-20 mx-auto object-contain transition-transform duration-300"
          style={{
            filter: isSelected ? 'drop-shadow(0 0 10px rgba(251, 191, 36, 0.5))' : 'none'
          }}
        />
        
        {/* Индикатор выбранного персонажа */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-white text-sm font-bold">✓</span>
          </div>
        )}
      </div>

      {/* Имя персонажа */}
      <h3 
        className="text-lg font-bold text-center mb-2"
        style={{ color: character.color }}
      >
        {character.name}
      </h3>

      {/* Описание персонажа */}
      <p className="text-sm text-gray-600 text-center leading-relaxed">
        {character.description}
      </p>

      {/* Индикатор награды */}
      <div className="mt-3 flex justify-center">
        <div 
          className="px-3 py-1 rounded-full text-xs font-medium text-white"
          style={{ backgroundColor: character.color }}
        >
          Ищет: {getRewardName(character.reward)}
        </div>
      </div>
    </div>
  );
};

/**
 * Получить русское название награды
 */
function getRewardName(reward: string): string {
  const rewardNames: Record<string, string> = {
    stihi: 'стихи',
    carrot: 'морковки',
    apple: 'яблоки',
    formula: 'формулы',
    berries: 'ягоды',
    gear: 'шестеренки',
    planet: 'планеты',
    flower: 'цветы',
    potato: 'картошку',
    notes: 'ноты'
  };
  
  return rewardNames[reward] || reward;
}