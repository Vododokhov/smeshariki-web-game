/**
 * @fileoverview Компонент игры сортировки - "Раздели по корзинкам"
 * Игрок должен распределить предметы по правильным категориям
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, addScore, nextStage } from "../../store/gameStore";
import { GameButton } from "../GameButton";
import { GameNotification } from "../GameNotification";
import { useSound } from "../SoundManager";
import { Zap, Target, Trophy } from "lucide-react";

// Импорт фонового изображения
import sortyBgImg from "../../assets/backgrounds/sort-bg.jpg";

// Импорт изображений
import appleImg from "../../assets/rewards/apple.png";
import carrotImg from "../../assets/rewards/carrot.png";
import berriesImg from "../../assets/rewards/berries.png";
import onionImg from "../../assets/rewards/onion.png";
import watermeloImg from "../../assets/rewards/watermelo.png";
import plumImg from "../../assets/rewards/plum.png";
import grapeImg from "../../assets/rewards/grape.png";
import pumpkinImg from "../../assets/rewards/pumpkin.png";
import tomatoImg from "../../assets/rewards/tomato.png";

interface SortingItem {
  id: number;
  name: string;
  category: "fruits" | "vegetables" | "berries";
  image: string;
}

const SORTING_ITEMS: SortingItem[] = [
  { id: 1, name: "Яблоко", category: "fruits", image: appleImg },
  { id: 2, name: "Морковка", category: "vegetables", image: carrotImg },
  { id: 3, name: "Арбуз", category: "berries", image: watermeloImg },
  { id: 4, name: "Лук", category: "vegetables", image: onionImg },
  { id: 5, name: "Слива", category: "fruits", image: plumImg },
  { id: 6, name: "Виноград", category: "berries", image: grapeImg },
  { id: 7, name: "Помидор", category: "vegetables", image: tomatoImg },
  { id: 8, name: "Тыква", category: "vegetables", image: pumpkinImg },
];

/**
 * Игра сортировки предметов по категориям
 */
export const SortingGameStage: React.FC = () => {
  const dispatch = useDispatch();
  const { score, selectedCharacter } = useSelector(
    (state: RootState) => state.game
  );
  const { playSound } = useSound();
  const [showSkipButton, setShowSkipButton] = useState(true);

  const [items] = useState<SortingItem[]>(
    SORTING_ITEMS.sort(() => Math.random() - 0.5).slice(0, 6)
  );
  const [sortedItems, setSortedItems] = useState<Record<string, SortingItem[]>>(
    {
      fruits: [],
      vegetables: [],
      berries: [],
    }
  );
  const [draggedItem, setDraggedItem] = useState<SortingItem | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  // Проверка завершения игры
  useEffect(() => {
    const totalSorted = Object.values(sortedItems).flat().length;
    if (totalSorted === items.length) {
      const correct = Object.entries(sortedItems).reduce(
        (acc, [category, categoryItems]) => {
          return (
            acc +
            categoryItems.filter((item) => item.category === category).length
          );
        },
        0
      );

      setCorrectCount(correct);
      setIsGameComplete(true);

      // Начисление очков
      const points = correct * 15 + (correct === items.length ? 50 : 0);
      dispatch(addScore(points));

      setShowNotification(true);
      playSound(correct === items.length ? "success" : "fail");
    }
  }, [sortedItems, items.length, dispatch]);

  /**
   * Начало перетаскивания
   */
  const handleDragStart = (item: SortingItem) => {
    setDraggedItem(item);
    playSound("click");
  };

  const handleTouchStart = (e: React.TouchEvent, item: SortingItem) => {
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDraggedItem(item);
    playSound("click");
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedItem || !touchStartPos) return;

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element) {
      const basket = element.closest("[data-basket]");
      if (basket) {
        const category = basket.getAttribute("data-basket") as
          | "fruits"
          | "vegetables"
          | "berries";
        handleDrop(category);
      }
    }

    setDraggedItem(null);
    setTouchStartPos(null);
  };

  /**
   * Обработка сброса в корзину
   */
  const handleDrop = (category: string) => {
    if (!draggedItem) return;

    setAttempts((prev) => prev + 1);

    setSortedItems((prev) => ({
      ...prev,
      [category]: [...prev[category], draggedItem],
    }));

    setDraggedItem(null);

    const isCorrect = draggedItem.category === category;
    playSound(isCorrect ? "pickup" : "fail");

    if (navigator.vibrate) {
      navigator.vibrate(isCorrect ? [100, 50, 100] : [200]);
    }
  };

  /**
   * Удаление предмета из корзины
   */
  const handleRemoveFromBasket = (category: string, itemId: number) => {
    setSortedItems((prev) => ({
      ...prev,
      [category]: prev[category].filter((item) => item.id !== itemId),
    }));
  };

  /**
   * Переход к следующему этапу
   */
  const handleContinue = () => {
    setShowNotification(false);
    dispatch(nextStage());
  };

  /**
   * Пропуск игры
   */
  const handleSkip = () => {
    setShowNotification(false);
    dispatch(nextStage());
  };

  /**
   * Перезапуск игры
   */
  const handleRestart = () => {
    setShowNotification(false);
    setSortedItems({ fruits: [], vegetables: [], berries: [] });
    setIsGameComplete(false);
    setCorrectCount(0);
    setAttempts(0);
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `url(${sortyBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Заголовок */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Target className="text-green-500 mr-3" size={32} />
            <h1 className="text-4xl font-bold text-gray-800">
              Раздели по корзинкам
            </h1>
            <Target className="text-green-500 ml-3" size={32} />
          </div>
          <p className="text-xl text-gray-600">
            Перетащи предметы в правильные корзины!
          </p>
        </div>

        {/* Статистика */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Zap className="text-yellow-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Попытки</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{attempts}</p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Trophy className="text-green-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Правильно</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {correctCount}/{items.length}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Trophy className="text-blue-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Очки</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{score}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Корзины */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          {[
            {
              key: "fruits",
              title: "Фрукты",
              image: appleImg,
              color: "bg-red-100 border-red-300",
            },
            {
              key: "vegetables",
              title: "Овощи",
              image: carrotImg,
              color: "bg-orange-100 border-orange-300",
            },
            {
              key: "berries",
              title: "Ягоды",
              image: berriesImg,
              color: "bg-purple-100 border-purple-300",
            },
          ].map((basket) => (
            <div
              key={basket.key}
              data-basket={basket.key}
              className={`${basket.color} border-2 border-dashed rounded-2xl p-4 min-h-48 transition-all duration-300 hover:scale-105`}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(basket.key)}
            >
              <div className="text-center mb-4">
                <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                  <img
                    src={basket.image}
                    alt={basket.title}
                    className="w-16 h-16 object-contain"
                  />
                  <h3 className="text-xl ml-2 font-bold text-gray-700">
                    {basket.title}
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {sortedItems[basket.key].map((item) => (
                  <div
                    key={item.id}
                    className={`
                      bg-white rounded-full p-4 text-center cursor-pointer transition-all duration-200
                      ${
                        item.category === basket.key
                          ? "border-2 border-green-400"
                          : "border-2 border-red-400"
                      }
                      hover:scale-105
                    `}
                    onClick={() => handleRemoveFromBasket(basket.key, item.id)}
                  >
                    <div className="w-16 h-16 mx-auto mb-0 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <div className="text-sm font-medium">{item.name}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Предметы для сортировки */}
        {!isGameComplete && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
              Перетащи предметы в корзины
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {items
                .filter(
                  (item) =>
                    !Object.values(sortedItems)
                      .flat()
                      .find((sorted) => sorted.id === item.id)
                )
                .map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(item)}
                    onTouchStart={(e) => handleTouchStart(e, item)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="bg-white rounded-lg p-4 text-center cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 hover:shadow-lg border-2 border-gray-200 touch-none"
                  >
                    <div className="w-12 h-12 mx-auto mb-2 flex items-center justify-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <div className="text-sm font-medium">{item.name}</div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Кнопки управления */}
        <div className="text-center space-y-4 mt-6">
          {/* Кнопка пропустить */}
          {showSkipButton && !showNotification && (
            <GameButton
              onClick={() => {
                playSound("click");
                setShowSkipButton(false);
                handleSkip();
              }}
              variant="secondary"
              size="medium"
            >
              Пропустить
            </GameButton>
          )}
        </div>

        {/* Модальное окно результата */}
        <GameNotification
          isVisible={showNotification}
          type={correctCount === items.length ? "success" : "failure"}
          title={correctCount === items.length ? "Отлично!" : "Молодец!"}
          message={`Правильно отсортировано: ${correctCount} из ${items.length}. Попыток: ${attempts}`}
          score={score}
          onContinue={handleContinue}
          // onSkip={handleSkip}
          onRestart={handleRestart}
          showContinueButton={true}
          showSkipButton={true}
          showRestartButton={true}
        />
      </div>
    </div>
  );
};
