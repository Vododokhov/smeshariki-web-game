/**
 * @fileoverview Компонент финальной игры сбора наград - "Собери награды"
 * Игрок должен собрать максимальное количество наград за ограниченное время
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RootState,
  addScore,
  addReward,
  nextStage,
  Character,
  RewardType,
  CHARACTERS,
} from "../../store/gameStore";
import { GameButton } from "../GameButton";
import { GameNotification } from "../GameNotification";
import { useSound } from "../SoundManager";
import { Gift, Timer, Trophy, Star } from "lucide-react";

// Импорт фоновых изображений
import pinBgImg from "../../assets/backgrounds/pin-bg.png";
import collectBgImg from "../../assets/backgrounds/collect-bg.jpg";

// Импорты изображений наград
import stihiImg from "../../assets/rewards/stihi.png";
import carrotImg from "../../assets/rewards/carrot.png";
import appleImg from "../../assets/rewards/apple.png";
import formulaImg from "../../assets/rewards/formula.png";
import berriesImg from "../../assets/rewards/berries.png";
import gearImg from "../../assets/rewards/gear.png";
import planetImg from "../../assets/rewards/planet.png";
import flowerImg from "../../assets/rewards/flower.png";
import potatoImg from "../../assets/rewards/potato.png";
import notesImg from "../../assets/rewards/notes.png";

/**
 * Маппинг наград на изображения
 */
const rewardImages = {
  stihi: stihiImg,
  carrot: carrotImg,
  apple: appleImg,
  formula: formulaImg,
  berries: berriesImg,
  gear: gearImg,
  planet: planetImg,
  flower: flowerImg,
  potato: potatoImg,
  notes: notesImg,
};

interface FallingReward {
  id: number;
  type: RewardType;
  x: number;
  y: number;
  speed: number;
  isTarget: boolean;
}

/**
 * Финальная игра сбора наград
 */
export const CollectGameStage: React.FC = () => {
  const dispatch = useDispatch();
  const { score, selectedCharacter, collectedRewards } = useSelector(
    (state: RootState) => state.game
  );
  const { playSound } = useSound();
  const [showSkipButton, setShowSkipButton] = useState(true);

  const [gameState, setGameState] = useState<
    "waiting" | "playing" | "complete"
  >("waiting");
  const [timeLeft, setTimeLeft] = useState(30);
  const [fallingRewards, setFallingRewards] = useState<FallingReward[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);
  const [targetCollected, setTargetCollected] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [nextRewardId, setNextRewardId] = useState(1);
  const [showNotification, setShowNotification] = useState(false);

  const targetReward = selectedCharacter
    ? CHARACTERS[selectedCharacter].reward
    : "apple";

  // Выбор фона в зависимости от персонажа
  const getBackgroundImage = () => {
    if (selectedCharacter === "pin") {
      return pinBgImg;
    }
    return collectBgImg;
  };

  /**
   * Начало игры
   */
  const startGame = () => {
    setGameState("playing");
    setTimeLeft(30);
    setCollectedCount(0);
    setTargetCollected(0);
    setMissedCount(0);
    setFallingRewards([]);
    setNextRewardId(1);
    setShowNotification(false);
    playSound("start");
  };

  /**
   * Таймер игры
   */
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === "playing" && timeLeft === 0) {
      setGameState("complete");

      // Финальные очки
      const finalScore = targetCollected * 20 + collectedCount * 5;
      dispatch(addScore(finalScore));
      dispatch(addReward(targetCollected));

      setShowNotification(true);
      playSound(targetCollected >= 5 ? "success" : "fail");
    }
  }, [gameState, timeLeft, targetCollected, collectedCount, dispatch]);

  /**
   * Генерация падающих наград
   */
  useEffect(() => {
    if (gameState === "playing") {
      const spawnTimer = setInterval(() => {
        const rewardTypes = Object.keys(rewardImages) as RewardType[];
        const isTarget = Math.random() < 0.4; // 40% шанс на целевую награду
        const rewardType = isTarget
          ? targetReward
          : rewardTypes[Math.floor(Math.random() * rewardTypes.length)];

        const newReward: FallingReward = {
          id: nextRewardId,
          type: rewardType,
          x: Math.random() * (window.innerWidth - 100),
          y: -50,
          speed: 2 + Math.random() * 3,
          isTarget,
        };

        setFallingRewards((prev) => [...prev, newReward]);
        setNextRewardId((prev) => prev + 1);
      }, 800);

      return () => clearInterval(spawnTimer);
    }
  }, [gameState, targetReward, nextRewardId]);

  /**
   * Анимация падения наград - более плавная с requestAnimationFrame
   */
  useEffect(() => {
    if (gameState === "playing") {
      let animationFrameId: number;
      let lastTime = Date.now();

      const animate = () => {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 16; // Нормализация к 60 FPS
        lastTime = currentTime;

        setFallingRewards((prev) => {
          const updated = prev.map((reward) => ({
            ...reward,
            y: reward.y + reward.speed * deltaTime,
          }));

          // Удаляем награды, которые упали за экран
          const filtered = updated.filter((reward) => {
            if (reward.y > window.innerHeight + 100) {
              if (reward.isTarget) {
                setMissedCount((prev) => prev + 1);
              }
              return false;
            }
            return true;
          });

          return filtered;
        });

        animationFrameId = requestAnimationFrame(animate);
      };

      animationFrameId = requestAnimationFrame(animate);

      return () => {
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
      };
    }
  }, [gameState]);

  /**
   * Сбор награды по клику или тапу
   */
  const collectReward = (rewardId: number) => {
    const reward = fallingRewards.find((r) => r.id === rewardId);
    if (!reward) return;

    playSound("collect");

    // Удаляем награду
    setFallingRewards((prev) => prev.filter((r) => r.id !== rewardId));

    setCollectedCount((prev) => prev + 1);

    if (reward.isTarget) {
      setTargetCollected((prev) => prev + 1);

      // Больше очков за целевые награды
      dispatch(addScore(20));

      // Вибрация для целевых наград
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      // Меньше очков за обычные награды
      dispatch(addScore(5));

      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
  };

  /**
   * Переход к следующему этапу
   */
  const handleContinue = () => {
    dispatch(nextStage());
  };

  /**
   * Перезапуск игры
   */
  const handleRestart = () => {
    setGameState("waiting");
  };

  return (
    <div
      className="min-h-screen p-6 overflow-hidden relative snap-none"
      style={{
        backgroundColor: "F5B8FE",
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Заголовок */}
      <div className="max-w-4xl mx-auto mb-8 relative z-10">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold text-gray-800">Собери награды</h1>
          </div>
          <p className="text-xl text-gray-600">
            Собери как можно больше{" "}
            {selectedCharacter
              ? CHARACTERS[selectedCharacter].reward === targetReward
                ? "своих "
                : ""
              : ""}
            наград!
          </p>
        </div>

        {/* Статистика */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Timer className="text-red-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Время</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{timeLeft}с</p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Star className="text-yellow-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Целевые</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {targetCollected}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Gift className="text-blue-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Всего</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {collectedCount}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Trophy className="text-green-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Очки</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{score}</p>
            </div>
          </div>
        </div>

        {/* Целевая награда */}
        {selectedCharacter && (
          <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4 mb-6">
            <div className="flex items-center justify-center">
              <img
                src={rewardImages[targetReward]}
                alt={targetReward}
                className="w-12 h-12 mr-3"
              />
              <div>
                <h3 className="font-bold text-yellow-800">
                  Твоя награда: {targetReward}
                </h3>
                <p className="text-yellow-700 text-sm">
                  За неё дают больше очков!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Игровая область с падающими наградами */}
      {gameState === "playing" && (
        <div className="fixed inset-0 pointer-events-none z-20">
          {fallingRewards.map((reward) => (
            <div
              key={reward.id}
              className={`
                absolute pointer-events-auto cursor-pointer
                ${reward.isTarget ? "animate-pulse" : ""}
                hover:scale-110 active:scale-95
              `}
              style={{
                left: `${reward.x}px`,
                top: `${reward.y}px`,
                transform: "translate(-50%, -50%)",
                willChange: "transform",
                transition: "transform 0.1s ease-out",
              }}
              onClick={() => collectReward(reward.id)}
              onTouchStart={(e) => {
                e.preventDefault();
                collectReward(reward.id);
              }}
            >
              <div
                className={`
                w-28 h-28 rounded-full p-2 shadow-lg
                ${
                  reward.isTarget
                    ? "bg-yellow-200 border-4 border-yellow-400"
                    : "bg-white border-2 border-gray-300"
                }
              `}
              >
                <img
                  src={rewardImages[reward.type]}
                  alt={reward.type}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Управление игрой */}
      <div className="max-w-4xl mx-auto text-center relative z-10">
        {gameState === "waiting" && (
          <div className="space-y-4">
            <div className="bg-blue-100 border-2 border-blue-300 rounded-2xl p-6 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-blue-800 mb-2">
                Готов к финальному испытанию?
              </h3>
              <p className="text-blue-700">
                У тебя есть 30 секунд, чтобы собрать как можно больше наград!
              </p>
            </div>

            <GameButton
              onClick={() => {
                playSound("click");
                startGame();
              }}
              variant="primary"
              size="large"
              className="text-xl px-8 py-4"
            >
              Начать сбор наград!
            </GameButton>
          </div>
        )}
        {/* Кнопка пропустить */}
        {/* {showSkipButton && gameState !== "complete" && (
          <div className="space-y-4">
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
          </div>
        )} */}

        {gameState === "complete" && (
          <div className="animate-scale-in">
            <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-6 mb-6 max-w-md mx-auto">
              <div className="flex items-center justify-center mb-3">
                <Trophy className="text-green-600 mr-2" size={32} />
                <h3 className="text-2xl font-bold text-green-800">Молодец!</h3>
              </div>
              <div className="space-y-2 text-green-700">
                <p>Собрано целевых наград: {targetCollected}</p>
                <p>Всего собрано: {collectedCount}</p>
                <p>Упущено целевых: {missedCount}</p>
                <p className="font-bold">
                  Заработано очков: {targetCollected * 20 + collectedCount * 5}
                </p>
              </div>
            </div>

            <div className="space-x-4">
              <GameButton
                onClick={() => {
                  playSound("click");
                  handleContinue();
                }}
                variant="success"
                size="large"
                className="text-xl px-8 py-4"
              >
                Завершить игру
              </GameButton>

              <GameButton
                onClick={() => {
                  playSound("click");
                  handleRestart();
                }}
                variant="secondary"
                size="medium"
              >
                Собрать еще раз
              </GameButton>
            </div>
          </div>
        )}
      </div>

      {/* Фейерверк при завершении */}
      {/* {gameState === "complete" && (
        <div className="fixed inset-0 pointer-events-none z-40">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="absolute animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: "2s",
              }}
            >
              { <Star className="text-yellow-400" size={24} /> }
            </div>
          ))}
        </div>
      )} */}
    </div>
  );
};
