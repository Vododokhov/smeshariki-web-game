/**
 * @fileoverview Компонент игры "Найди лишний предмет"
 * Игрок должен найти предмет, который не подходит к группе
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, addScore, nextStage } from "../../store/gameStore";
import { GameButton } from "../GameButton";
import { GameNotification } from "../GameNotification";
import { useSound } from "../SoundManager";
import { Eye, Clock, Trophy, Target } from "lucide-react";

// Импорт фонового изображения
import oddOneBgImg from "../../assets/backgrounds/oddone-bg.jpg";

// Импорт изображений наград
import appleImg from "../../assets/rewards/apple.png";
import carrotImg from "../../assets/rewards/carrot.png";
import berriesImg from "../../assets/rewards/berries.png";
import flowerImg from "../../assets/rewards/flower.png";
import formulaImg from "../../assets/rewards/formula.png";
import gearImg from "../../assets/rewards/gear.png";
import notesImg from "../../assets/rewards/notes.png";
import planetImg from "../../assets/rewards/planet.png";
import potatoImg from "../../assets/rewards/potato.png";
import stihiImg from "../../assets/rewards/stihi.png";

interface GameItem {
  id: number;
  name: string;
  category: string;
  image: string;
  isOddOne: boolean;
}

interface GameRound {
  items: GameItem[];
  theme: string;
  description: string;
}

const GAME_ROUNDS: GameRound[] = [
  {
    theme: "Еда",
    description: "Найди то, что нельзя есть",
    items: [
      {
        id: 1,
        name: "Яблоко",
        category: "food",
        image: appleImg,
        isOddOne: false,
      },
      {
        id: 2,
        name: "Морковка",
        category: "food",
        image: carrotImg,
        isOddOne: false,
      },
      {
        id: 3,
        name: "Ягоды",
        category: "food",
        image: berriesImg,
        isOddOne: false,
      },
      {
        id: 4,
        name: "Картошка",
        category: "food",
        image: potatoImg,
        isOddOne: false,
      },
      {
        id: 5,
        name: "Шестеренка",
        category: "tool",
        image: gearImg,
        isOddOne: true,
      },
      {
        id: 6,
        name: "Цветок",
        category: "nature",
        image: flowerImg,
        isOddOne: false,
      },
    ],
  },
  {
    theme: "Наука",
    description: "Найди то, что не связано с наукой",
    items: [
      {
        id: 7,
        name: "Формула",
        category: "science",
        image: formulaImg,
        isOddOne: false,
      },
      {
        id: 8,
        name: "Планета",
        category: "science",
        image: planetImg,
        isOddOne: false,
      },
      {
        id: 9,
        name: "Шестеренка",
        category: "science",
        image: gearImg,
        isOddOne: false,
      },
      {
        id: 10,
        name: "Стихи",
        category: "art",
        image: stihiImg,
        isOddOne: true,
      },
      {
        id: 11,
        name: "Яблоко",
        category: "food",
        image: appleImg,
        isOddOne: false,
      },
      {
        id: 12,
        name: "Ноты",
        category: "art",
        image: notesImg,
        isOddOne: false,
      },
    ],
  },
  {
    theme: "Творчество",
    description: "Найди то, что не связано с творчеством",
    items: [
      {
        id: 13,
        name: "Стихи",
        category: "art",
        image: stihiImg,
        isOddOne: false,
      },
      {
        id: 14,
        name: "Ноты",
        category: "art",
        image: notesImg,
        isOddOne: false,
      },
      {
        id: 15,
        name: "Цветок",
        category: "art",
        image: flowerImg,
        isOddOne: false,
      },
      {
        id: 16,
        name: "Формула",
        category: "science",
        image: formulaImg,
        isOddOne: true,
      },
      {
        id: 17,
        name: "Морковка",
        category: "food",
        image: carrotImg,
        isOddOne: false,
      },
      {
        id: 18,
        name: "Ягоды",
        category: "food",
        image: berriesImg,
        isOddOne: false,
      },
    ],
  },
];

/**
 * Игра "Найди лишний предмет"
 */
export const OddOneOutStage: React.FC = () => {
  const dispatch = useDispatch();
  const { score, selectedCharacter } = useSelector(
    (state: RootState) => state.game
  );
  const { playSound } = useSound();

  const [currentRound, setCurrentRound] = useState(0);
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [showFailureNotification, setShowFailureNotification] = useState(false);
  const [isRoundComplete, setIsRoundComplete] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [roundTime, setRoundTime] = useState(0);
  const [feedback, setFeedback] = useState<string>("");
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Инициализация раунда
  useEffect(() => {
    if (currentRound < GAME_ROUNDS.length) {
      const round = GAME_ROUNDS[currentRound];
      const shuffledItems = [...round.items].sort(() => Math.random() - 0.5);
      setGameItems(shuffledItems);
      setIsRoundComplete(false);
      setSelectedItem(null);
      setFeedback("");
      setRoundTime(0);
    }
  }, [currentRound]);

  // Таймер раунда
  useEffect(() => {
    if (!isRoundComplete && !isGameComplete) {
      const timer = setInterval(() => {
        setRoundTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, isRoundComplete, isGameComplete]);

  /**
   * Обработка выбора предмета
   */
  const handleItemSelect = (item: GameItem) => {
    if (isRoundComplete) return;

    playSound("click");
    setSelectedItem(item);
    setAttempts((prev) => prev + 1);

    // Вибрация для обратной связи
    if (navigator.vibrate) {
      navigator.vibrate(item.isOddOne ? [100, 50, 100] : [200]);
    }

    if (item.isOddOne) {
      playSound("success");
      setCorrectAnswers((prev) => prev + 1);
      setFeedback("Правильно! Это лишний предмет! 🎉");
      setIsRoundComplete(true);

      // Начисление очков
      const timeBonus = Math.max(0, 30 - roundTime) * 2;
      const attemptBonus = attempts === 0 ? 50 : Math.max(0, 25 - attempts * 5);
      const points = 100 + timeBonus + attemptBonus;
      dispatch(addScore(points));

      // Переход к следующему раунду через 2 секунды
      setTimeout(() => {
        if (currentRound + 1 < GAME_ROUNDS.length) {
          setCurrentRound((prev) => prev + 1);
        } else {
          setIsGameComplete(true);
          setShowCompletionModal(true);
        }
      }, 2000);
    } else {
      playSound("error");
      setFeedback("Попробуй еще раз! Этот предмет подходит к группе. 🤔");

      // Убираем обратную связь через 2 секунды
      setTimeout(() => {
        setFeedback("");
        setSelectedItem(null);
      }, 2000);
    }
  };

  /**
   * Переход к следующему этапу
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
    setCurrentRound(0);
    setCorrectAnswers(0);
    setAttempts(0);
    setIsGameComplete(false);
    setShowCompletionModal(false);
    setShowSuccessNotification(false);
    setShowFailureNotification(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const currentRoundData = GAME_ROUNDS[currentRound];

  return (
    <div
      className="min-h-screen p-3 sm:p-6"
      style={{
        backgroundImage: `url(${oddOneBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Заголовок */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-8">
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Eye className="text-purple-500 mr-2 sm:mr-3" size={24} />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
              Найди лишний предмет
            </h1>
            <Eye className="text-purple-500 ml-2 sm:ml-3" size={24} />
          </div>
          {currentRoundData && (
            <div className="bg-white/80 backdrop-blur-sm rounded-lg sm:rounded-xl p-3 sm:p-4 mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-2xl font-bold text-purple-700 mb-1 sm:mb-2">
                Раунд {currentRound + 1}: {currentRoundData.theme}
              </h2>
              <p className="text-sm sm:text-lg text-gray-600">
                {currentRoundData.description}
              </p>
            </div>
          )}
        </div>

        {/* Статистика */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Target className="text-purple-500 mr-1" size={16} />
                <span className="text-xs sm:text-base font-bold text-gray-700">
                  Раунд
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {currentRound + 1}/{GAME_ROUNDS.length}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Clock className="text-blue-500 mr-1" size={16} />
                <span className="text-xs sm:text-base font-bold text-gray-700">
                  Время
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {formatTime(roundTime)}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Trophy className="text-green-500 mr-1" size={16} />
                <span className="text-xs sm:text-base font-bold text-gray-700">
                  Правильно
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {correctAnswers}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Trophy className="text-yellow-500 mr-1" size={16} />
                <span className="text-xs sm:text-base font-bold text-gray-700">
                  Очки
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {score}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Игровое поле */}
        {!isGameComplete && gameItems.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-6">
              {gameItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemSelect(item)}
                  className={`
                    relative bg-white rounded-xl p-3 sm:p-4 cursor-pointer transition-all duration-300
                    hover:scale-105 hover:shadow-lg border-2 sm:border-4 touch-none
                    ${
                      selectedItem?.id === item.id
                        ? item.isOddOne
                          ? "border-green-400 bg-green-50"
                          : "border-red-400 bg-red-50"
                        : "border-gray-200 hover:border-purple-300"
                    }
                  `}
                >
                  <div className="mb-2 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-28 h-28 object-contain"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-center text-gray-700">
                    {item.name}
                  </h3>

                  {selectedItem?.id === item.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl">
                      <div
                        className={`
                        text-4xl animate-scale-in
                        ${item.isOddOne ? "✅" : "❌"}
                      `}
                      >
                        {item.isOddOne ? "✅" : "❌"}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Обратная связь */}
        {feedback && (
          <div className="text-center mb-6 animate-fade-in">
            <div
              className={`
              inline-block px-6 py-3 rounded-full text-xl font-bold
              ${
                selectedItem?.isOddOne
                  ? "bg-green-100 text-green-800 border-2 border-green-300"
                  : "bg-yellow-100 text-yellow-800 border-2 border-yellow-300"
              }
            `}
            >
              {feedback}
            </div>
          </div>
        )}

        {/* Результат игры - теперь в модальном окне */}
        <GameNotification
          isVisible={showCompletionModal}
          type="success"
          title="Отлично!"
          message={`Правильных ответов: ${correctAnswers} из ${GAME_ROUNDS.length}. Общее количество попыток: ${attempts}. Ты отлично справился с поиском лишних предметов! 🎉`}
          score={score}
          onContinue={handleContinue}
          // onSkip={handleContinue}
          onRestart={handleRestart}
          showContinueButton={true}
          showSkipButton={true}
          showRestartButton={true}
        />

        {/* Кнопки управления */}
        <div className="text-center space-y-4 mt-6">
          {/* Кнопка пропустить */}
          {showSkipButton && !isGameComplete && !showCompletionModal && (
            <GameButton
              onClick={() => {
                playSound("click");
                setShowSkipButton(false);
                dispatch(nextStage());
              }}
              variant="secondary"
              size="medium"
            >
              Пропустить
            </GameButton>
          )}
        </div>
      </div>
    </div>
  );
};
