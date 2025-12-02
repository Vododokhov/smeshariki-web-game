/**
 * @fileoverview Компонент экрана выбора персонажа
 * Позволяет игроку выбрать своего героя из Смешариков
 */

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import {
  selectCharacter,
  nextStage,
  Character,
  CHARACTERS,
} from "../../store/gameStore";
import { CharacterCard } from "../CharacterCard";
import { GameButton } from "../GameButton";
import { ArrowRight, Users } from "lucide-react";

// Импорты изображений персонажей
import barashImg from "../../assets/characters/barash.png";
import kroshImg from "../../assets/characters/krosh.png";
import ezhikImg from "../../assets/characters/ezhik.png";
import losyashImg from "../../assets/characters/losyash.png";
import sovunyaImg from "../../assets/characters/sovunya.png";
import nyushaImg from "../../assets/characters/nyusha.png";
import pinImg from "../../assets/characters/pin.png";
import karKarychImg from "../../assets/characters/kar-karych.png";
import kopatychImg from "../../assets/characters/kopatych.png";
import bibiImg from "../../assets/characters/bibi.png";

/**
 * Маппинг персонажей на их изображения
 */
const characterImages: Record<Character, string> = {
  barash: barashImg,
  krosh: kroshImg,
  ezhik: ezhikImg,
  losyash: losyashImg,
  sovunya: sovunyaImg,
  nyusha: nyushaImg,
  pin: pinImg,
  "kar-karych": karKarychImg,
  kopatych: kopatychImg,
  bibi: bibiImg,
};

/**
 * Экран выбора персонажа
 * Отображает всех доступных персонажей для выбора
 */
export const CharacterSelectStage: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null
  );

  /**
   * Обработка выбора персонажа
   */
  const handleCharacterSelect = (character: Character) => {
    setSelectedCharacter(character);
    dispatch(selectCharacter(character));
  };

  /**
   * Переход к следующему этапу
   */
  const handleContinue = () => {
    if (selectedCharacter) {
      dispatch(nextStage());
    }
  };

  return (
    <div
      className="min-h-screen p-4 sm:p-6 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #B8E6B8 0%, #70D0A0 50%, #4ECDC4 100%)",
      }}
    >
      {/* Заголовок */}
      <div className="text-center mb-4 sm:mb-8">
        <div className="flex items-center justify-center mb-2 sm:mb-4">
          <Users className="text-white mr-2" size={24} />
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
            Выбери своего героя!
          </h1>
          <Users className="text-white ml-2" size={24} />
        </div>

        <p className="text-base sm:text-xl text-white/90 font-medium">
          Каждый персонаж ищет свои особенные награды
        </p>
      </div>

      {/* Сетка персонажей */}
      <div className="max-w-6xl mx-auto mb-4 sm:mb-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4 md:gap-6">
          {Object.values(CHARACTERS).map((character) => (
            <CharacterCard
              key={character.id}
              character={character}
              isSelected={selectedCharacter === character.id}
              onClick={handleCharacterSelect}
              imageSrc={characterImages[character.id]}
            />
          ))}
        </div>
      </div>

      {/* Информация о выбранном персонаже */}
      {selectedCharacter && (
        <div className="max-w-2xl mx-auto mb-4 sm:mb-8 animate-scale-in">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 border-2 border-white/50 text-center">
            <h3
              className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 inline-block mr-2"
              style={{ color: CHARACTERS[selectedCharacter].color }}
            >
              Ты выбрал {CHARACTERS[selectedCharacter].name}!
            </h3>
            <div
              className="inline-block px-4 py-2 rounded-full text-white font-medium"
              style={{ backgroundColor: CHARACTERS[selectedCharacter].color }}
            >
              Цель: собрать все{" "}
              {getRewardName(CHARACTERS[selectedCharacter].reward)}
            </div>
          </div>
        </div>
      )}

      {/* Кнопка продолжения */}
      <div className="text-center">
        <GameButton
          onClick={handleContinue}
          disabled={!selectedCharacter}
          variant="success"
          size="large"
          className="text-xl px-8 py-4"
        >
          <div className="flex items-center space-x-3">
            <span>Начать приключение</span>
            <ArrowRight className="w-6 h-6" />
          </div>
        </GameButton>
      </div>
    </div>
  );
};

/**
 * Получить русское название награды
 */
function getRewardName(reward: string): string {
  const rewardNames: Record<string, string> = {
    stihi: "стихи",
    carrot: "морковки",
    apple: "яблоки",
    formula: "формулы",
    berries: "ягоды",
    gear: "шестеренки",
    planet: "планеты",
    flower: "цветы",
    potato: "картошку",
    notes: "ноты",
  };

  return rewardNames[reward] || reward;
}
