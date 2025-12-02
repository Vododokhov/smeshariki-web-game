/**
 * @fileoverview Компонент игры-пазла - "Собери картинку"
 * Игрок собирает пазл из частей изображения персонажа
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, addScore, nextStage } from "../../store/gameStore";
import { GameButton } from "../GameButton";
import { GameNotification } from "../GameNotification";
import { useSound } from "../SoundManager";
import { Puzzle, Timer } from "lucide-react";

// Импорт фонового изображения
import pazzleBgImg from "../../assets/backgrounds/pazzle-bg.jpg";

// Импорт изображения для пазла
import puzzleImg from "../../assets/puzzle-image.jpg";

interface PuzzlePiece {
  id: number;
  correctPosition: number;
  currentPosition: number | null;
  isPlaced: boolean;
}

/**
 * Игра-пазл с персонажем Крош
 */
export const PuzzleGameStage: React.FC = () => {
  const dispatch = useDispatch();
  const { score, selectedCharacter } = useSelector(
    (state: RootState) => state.game
  );
  const { playSound } = useSound();

  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [draggedPiece, setDraggedPiece] = useState<PuzzlePiece | null>(null);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameTime, setGameTime] = useState(0);
  const [showSkipButton, setShowSkipButton] = useState(true);
  const [touchStartPos, setTouchStartPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Инициализация пазла
  useEffect(() => {
    const initialPieces: PuzzlePiece[] = [];
    for (let i = 0; i < 12; i++) {
      initialPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: null,
        isPlaced: false,
      });
    }

    // Перемешиваем кусочки
    const shuffled = [...initialPieces].sort(() => Math.random() - 0.5);
    setPieces(shuffled);
  }, []);

  // Таймер игры
  useEffect(() => {
    if (!isGameComplete) {
      const timer = setInterval(() => {
        setGameTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [startTime, isGameComplete]);

  // Проверка завершения игры
  useEffect(() => {
    const placedPieces = pieces.filter((piece) => piece.isPlaced);
    const correctlyPlaced = placedPieces.filter(
      (piece) => piece.currentPosition === piece.correctPosition
    ).length;

    if (placedPieces.length === 12 && correctlyPlaced === 12) {
      setIsGameComplete(true);
      setShowNotification(true);
      playSound("complete");

      // Начисление очков (бонус за скорость)
      const timeBonus = Math.max(0, 300 - gameTime);
      const moveBonus = Math.max(0, 50 - moves);
      const totalPoints = 200 + timeBonus + moveBonus;
      dispatch(addScore(totalPoints));
    }
  }, [pieces, gameTime, moves, dispatch, playSound]);

  /**
   * Начало перетаскивания кусочка
   */
  const handleDragStart = (piece: PuzzlePiece) => {
    if (piece.isPlaced) return;
    setDraggedPiece(piece);
    playSound("click");

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  /**
   * Touch события для планшетов
   */
  const handleTouchStart = (e: React.TouchEvent, piece: PuzzlePiece) => {
    if (piece.isPlaced) return;
    e.preventDefault();
    const touch = e.touches[0];
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDraggedPiece(piece);
    playSound("click");

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!draggedPiece) return;
    e.preventDefault();

    const touch = e.changedTouches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);

    if (element) {
      const position = element.getAttribute("data-position");
      if (position !== null) {
        handleDrop(parseInt(position));
      }
    }

    setDraggedPiece(null);
    setTouchStartPos(null);
  };

  /**
   * Размещение кусочка
   */
  const handleDrop = (position: number) => {
    if (!draggedPiece) return;

    setMoves((prev) => prev + 1);

    setPieces((prev) =>
      prev.map((piece) => {
        if (piece.id === draggedPiece.id) {
          return {
            ...piece,
            currentPosition: position,
            isPlaced: true,
          };
        }
        // Убираем другой кусочек с этой позиции
        if (piece.currentPosition === position) {
          return {
            ...piece,
            currentPosition: null,
            isPlaced: false,
          };
        }
        return piece;
      })
    );

    setDraggedPiece(null);

    // Звук и вибрация для обратной связи
    const isCorrect = draggedPiece.correctPosition === position;
    playSound(isCorrect ? "match" : "move");

    if (navigator.vibrate) {
      navigator.vibrate(isCorrect ? [100, 50, 100] : [200]);
    }
  };

  /**
   * Удаление кусочка с поля
   */
  const handleRemovePiece = (pieceId: number) => {
    setPieces((prev) =>
      prev.map((piece) =>
        piece.id === pieceId
          ? { ...piece, currentPosition: null, isPlaced: false }
          : piece
      )
    );
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
    setIsGameComplete(false);
    setShowNotification(false);
    setMoves(0);

    const initialPieces: PuzzlePiece[] = [];
    for (let i = 0; i < 12; i++) {
      initialPieces.push({
        id: i,
        correctPosition: i,
        currentPosition: null,
        isPlaced: false,
      });
    }
    const shuffled = [...initialPieces].sort(() => Math.random() - 0.5);
    setPieces(shuffled);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="min-h-screen p-3 sm:p-6"
      style={{
        backgroundImage: `url(${pazzleBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Заголовок */}
      <div className="max-w-4xl mx-auto mb-4 sm:mb-8">
        <div className="text-center mb-4 sm:mb-6">
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <Puzzle className="text-blue-500 mr-2 sm:mr-3" size={24} />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-800">
              Собери пазл
            </h1>
            <Puzzle className="text-blue-500 ml-2 sm:ml-3" size={24} />
          </div>
          <p className="text-base sm:text-xl text-gray-600">
            Собери картинку со всеми Смешариками!
          </p>
        </div>

        {/* Статистика */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Timer className="text-blue-500 mr-1" size={16} />
                <span className="text-xs sm:text-base font-bold text-gray-700">
                  Время
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {formatTime(gameTime)}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-1 sm:mb-2">
                <Puzzle className="text-green-500 mr-1" size={16} />
                <span className="text-xs sm:text-base font-bold text-gray-700">
                  Ходы
                </span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-800">
                {moves}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-1 sm:mb-2">
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

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
          {/* Поле для сборки пазла */}
          <div className="bg-white/80 backdrop-blur-sm p-3 sm:p-6">
            <h3 className="text-base sm:text-xl font-bold text-gray-700 mb-3 sm:mb-4 text-center">
              Собери здесь
            </h3>
            <div className="grid grid-cols-4 gap-0 max-w-md mx-auto">
              {Array.from({ length: 12 }, (_, index) => {
                const placedPiece = pieces.find(
                  (piece) => piece.currentPosition === index && piece.isPlaced
                );

                return (
                  <div
                    key={index}
                    className="aspect-square border border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden bg-gray-50"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                    data-position={index}
                  >
                    {placedPiece && (
                      <div
                        className={`
                          w-full h-full cursor-pointer transition-all duration-200
                          ${
                            placedPiece.correctPosition === index
                              ? "border border-green-400"
                              : "border border-yellow-400"
                          }
                        `}
                        style={{
                          backgroundImage: `url(${puzzleImg})`,
                          backgroundSize: "400%",
                          backgroundPosition: `${
                            -(placedPiece.correctPosition % 4) * 100
                          }% ${
                            -Math.floor(placedPiece.correctPosition / 4) * 100
                          }%`,
                        }}
                        onClick={() => handleRemovePiece(placedPiece.id)}
                      />
                    )}

                    {!placedPiece && (
                      <div className="text-gray-400 text-sm">{index + 1}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Кусочки пазла */}
          <div className="bg-white/80 backdrop-blur-sm  p-3 sm:p-6">
            <h3 className="text-base sm:text-xl font-bold text-gray-700 mb-3 sm:mb-4 text-center">
              Кусочки пазла
            </h3>
            <div className="grid grid-cols-4 gap-2 sm:gap-3 max-w-md mx-auto">
              {pieces
                .filter((piece) => !piece.isPlaced)
                .map((piece) => (
                  <div
                    key={piece.id}
                    draggable
                    onDragStart={() => handleDragStart(piece)}
                    onTouchStart={(e) => handleTouchStart(e, piece)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className="aspect-square cursor-grab active:cursor-grabbing transition-all duration-200 hover:scale-110 hover:shadow-lg border border-gray-300 sm:border-2 rounded-lg overflow-hidden"
                    style={{
                      backgroundImage: `url(${puzzleImg})`,
                      backgroundSize: "400%",
                      backgroundPosition: `${
                        -(piece.correctPosition % 4) * 100
                      }% ${-Math.floor(piece.correctPosition / 4) * 100}%`,
                    }}
                  />
                ))}
            </div>
          </div>
        </div>

        {/* Модальное окно с результатом */}
        <GameNotification
          isVisible={showNotification}
          type="success"
          title="Отлично!"
          message={`Пазл собран за ${formatTime(gameTime)}! Количество ходов: ${moves}`}
          score={score}
          onContinue={() => {
            playSound("click");
            setShowNotification(false);
            handleContinue();
          }}
          onRestart={() => {
            playSound("click");
            handleRestart();
          }}
          showContinueButton={true}
          showRestartButton={true}
          showSkipButton={false}
        />

        {/* Кнопки управления */}
        <div className="text-center space-y-4 mt-6">
          {/* Кнопка пропустить */}
          {showSkipButton && !isGameComplete && (
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
