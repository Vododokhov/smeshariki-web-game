/**
 * @fileoverview Компонент игры на память - "Собери пары"
 * Классическая игра в поиск парных карточек с персонажами Смешариков
 */

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RootState,
  initMemoryGame,
  flipCard,
  resetFlippedCards,
  nextStage,
} from "../../store/gameStore";
import { GameButton } from "../GameButton";
import { GameNotification } from "../GameNotification";
import { useSound } from "../SoundManager";
import { Brain, Star, Trophy } from "lucide-react";

// Импорт фонового изображения
import memoryBgImg from "../../assets/backgrounds/memory-bg.jpg";

// Импорты изображений персонажей
import barashImg from "../../assets/characters/barash.png";
import kroshImg from "../../assets/characters/krosh.png";
import ezhikImg from "../../assets/characters/ezhik.png";
import losyashImg from "../../assets/characters/losyash.png";
import sovunyaImg from "../../assets/characters/sovunya.png";
import nyushaImg from "../../assets/characters/nyusha.png";

/**
 * Маппинг персонажей на изображения для игры на память
 */
const memoryGameImages = {
  barash: barashImg,
  krosh: kroshImg,
  ezhik: ezhikImg,
  losyash: losyashImg,
  sovunya: sovunyaImg,
  nyusha: nyushaImg,
};

/**
 * Игра на память с карточками Смешариков
 * Игрок должен найти все пары карточек
 */
export const MemoryGameStage: React.FC = () => {
  const dispatch = useDispatch();
  const { memoryGame, score } = useSelector((state: RootState) => state.game);
  const { playSound } = useSound();
  const [showingCards, setShowingCards] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(true);

  // Инициализация игры при загрузке компонента
  useEffect(() => {
    dispatch(initMemoryGame());
  }, [dispatch]);

  // Показ модального окна при завершении игры
  useEffect(() => {
    if (memoryGame.isGameComplete && !showCompletionModal) {
      setShowCompletionModal(true);
    }
  }, [memoryGame.isGameComplete, showCompletionModal]);

  // Автоматический сброс перевернутых карт
  useEffect(() => {
    if (memoryGame.flippedCards.length === 2) {
      const card1 = memoryGame.cards.find(
        (c) => c.id === memoryGame.flippedCards[0]
      );
      const card2 = memoryGame.cards.find(
        (c) => c.id === memoryGame.flippedCards[1]
      );

      if (card1 && card2 && card1.character === card2.character) {
        playSound("match");
      } else {
        playSound("error");
      }

      const timer = setTimeout(() => {
        setShowingCards(true);
        setTimeout(() => {
          dispatch(resetFlippedCards());
          setShowingCards(false);
        }, 1500);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [memoryGame.flippedCards, memoryGame.cards, dispatch, playSound]);

  /**
   * Обработка клика по карточке
   */
  const handleCardClick = (cardId: number) => {
    if (!showingCards) {
      playSound("click");
      dispatch(flipCard(cardId));
    }
  };

  /**
   * Переход к следующему этапу после завершения игры
   */
  const handleContinue = () => {
    playSound("click");
    setShowCompletionModal(false);
    dispatch(nextStage());
  };

  /**
   * Перезапуск игры
   */
  const handleRestart = () => {
    playSound("click");
    setShowCompletionModal(false);
    dispatch(initMemoryGame());
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `url(${memoryBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Заголовок и статистика */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Brain className="text-purple-500 mr-3" size={32} />
            <h1 className="text-4xl font-bold text-gray-800">Игра на память</h1>
            <Brain className="text-purple-500 ml-3" size={32} />
          </div>
          <p className="text-xl text-gray-600">
            Найди все пары карточек с одинаковыми персонажами!
          </p>
        </div>

        {/* Статистика игры */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Star className="text-yellow-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Попытки</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {memoryGame.attempts}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Trophy className="text-green-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Пары найдено</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {memoryGame.matchedPairs}/6
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Star className="text-blue-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Очки</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{score}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Игровое поле */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="grid grid-cols-4 gap-3 md:gap-4">
          {memoryGame.cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                aspect-square cursor-pointer transition-all duration-500 transform
                ${
                  card.isFlipped || card.isMatched
                    ? "rotate-0"
                    : "hover:scale-105"
                }
              `}
            >
              {/* Карточка */}
              <div className="relative w-full h-full">
                {/* Задняя сторона */}
                <div
                  className={`
                    absolute inset-0 rounded-2xl border-4 border-white shadow-lg
                    bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400
                    flex items-center justify-center transition-all duration-500
                    ${
                      card.isFlipped || card.isMatched
                        ? "opacity-0 rotate-y-180"
                        : "opacity-100 rotate-y-0"
                    }
                  `}
                >
                  <div className="text-white text-4xl font-bold animate-pulse">
                    ?
                  </div>
                </div>

                {/* Передняя сторона */}
                <div
                  className={`
                    absolute inset-0 rounded-2xl border-4 shadow-lg
                    bg-white flex items-center justify-center transition-all duration-500
                    ${
                      card.isFlipped || card.isMatched
                        ? "opacity-100 rotate-y-0"
                        : "opacity-0 rotate-y-180"
                    }
                    ${
                      card.isMatched
                        ? "border-green-400 bg-green-50 animate-[shimmer_2s_ease-in-out_infinite]"
                        : "border-blue-400"
                    }
                  `}
                >
                  <img
                    src={memoryGameImages[card.character]}
                    alt={card.character}
                    className="w-32 h-32 object-contain"
                  />

                  {/* Индикатор найденной пары */}
                  {card.isMatched && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✓</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Кнопки управления */}
      <div className="text-center space-y-4">
        {!memoryGame.isGameComplete && (
          <GameButton
            onClick={() => {
              playSound("click");
              handleRestart();
            }}
            variant="secondary"
            size="large"
          >
            Начать заново
          </GameButton>
        )}
        {/* Кнопка пропустить */}
        {showSkipButton && !showCompletionModal && (
          <GameButton
            onClick={() => {
              playSound("click");
              setShowSkipButton(false);
              dispatch(nextStage());
            }}
            variant="secondary"
            className="ml-4"
            size="medium"
          >
            Пропустить
          </GameButton>
        )}
      </div>

      {/* Модальное окно завершения игры */}
      <GameNotification
        isVisible={showCompletionModal}
        type="success"
        title="Поздравляем!"
        message={`Вы нашли все пары за ${memoryGame.attempts} попыток!`}
        score={score}
        onContinue={handleContinue}
        // onSkip={handleContinue}
        onRestart={handleRestart}
        showContinueButton={true}
        showSkipButton={true}
        showRestartButton={true}
      />
    </div>
  );
};
