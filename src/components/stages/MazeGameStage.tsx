/**
 * @fileoverview Компонент игры-лабиринта - "Лабиринт с препятствиями"
 * Игрок должен провести персонажа через лабиринт к цели
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RootState,
  addScore,
  nextStage,
  setMazePosition,
} from "../../store/gameStore";
import { GameButton } from "../GameButton";
import { GameNotification } from "../GameNotification";
import { useSound } from "../SoundManager";
import {
  Navigation,
  Target,
  Trophy,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

// Импорт фонового изображения
import mazeBgImg from "../../assets/backgrounds/maze-bg.jpg";

interface MazeCell {
  x: number;
  y: number;
  type: "wall" | "path" | "start" | "finish" | "obstacle";
}

/**
 * Игра-лабиринт с препятствиями
 */
export const MazeGameStage: React.FC = () => {
  const dispatch = useDispatch();
  const { score, selectedCharacter, mazePosition } = useSelector(
    (state: RootState) => state.game
  );
  const { playSound } = useSound();
  const [showSkipButton, setShowSkipButton] = useState(true);

  const [maze, setMaze] = useState<MazeCell[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 1, y: 1 });
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameTime, setGameTime] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const MAZE_SIZE = 8;

  // Генерация лабиринта
  useEffect(() => {
    generateMaze();
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

  // Показать уведомление при завершении игры
  useEffect(() => {
    if (isGameComplete) {
      setShowNotification(true);
    }
  }, [isGameComplete]);

  /**
   * Генерация простого лабиринта
   */
  const generateMaze = () => {
    const newMaze: MazeCell[][] = [];

    for (let y = 0; y < MAZE_SIZE; y++) {
      const row: MazeCell[] = [];
      for (let x = 0; x < MAZE_SIZE; x++) {
        let type: MazeCell["type"] = "wall";

        // Создаем простой лабиринт с проходами
        if (x === 1 && y === 1) {
          type = "start";
        } else if (x === MAZE_SIZE - 2 && y === MAZE_SIZE - 2) {
          type = "finish";
        } else if (
          (y === 1 && x > 0 && x < MAZE_SIZE - 1) ||
          (x === 1 && y > 0 && y < MAZE_SIZE - 1) ||
          (y === MAZE_SIZE - 2 && x > 0 && x < MAZE_SIZE - 1) ||
          (x === MAZE_SIZE - 2 && y > 0 && y < MAZE_SIZE - 1) ||
          (x === 3 && y >= 3 && y <= 5) ||
          (y === 3 && x >= 3 && x <= 5) ||
          (x === 5 && y >= 1 && y <= 3)
        ) {
          type = Math.random() < 0.15 ? "obstacle" : "path"; // Увеличен шанс препятствий
        }

        row.push({ x, y, type });
      }
      newMaze.push(row);
    }

    setMaze(newMaze);
    setPlayerPos({ x: 1, y: 1 });
    dispatch(setMazePosition({ x: 1, y: 1 }));
  };

  /**
   * Движение игрока
   */
  const movePlayer = (direction: "up" | "down" | "left" | "right") => {
    const { x, y } = playerPos;
    let newX = x;
    let newY = y;

    switch (direction) {
      case "up":
        newY = Math.max(0, y - 1);
        break;
      case "down":
        newY = Math.min(MAZE_SIZE - 1, y + 1);
        break;
      case "left":
        newX = Math.max(0, x - 1);
        break;
      case "right":
        newX = Math.min(MAZE_SIZE - 1, x + 1);
        break;
    }

    const targetCell = maze[newY]?.[newX];

    if (!targetCell || targetCell.type === "wall") {
      // Вибрация при столкновении со стеной
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
      return;
    }

    if (targetCell.type === "obstacle") {
      // Бомба - можно пройти, но минус очки
      playSound("error");
      dispatch(addScore(-10));
      if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    } else {
      // Обычное движение
      playSound("move");
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }

    setPlayerPos({ x: newX, y: newY });
    dispatch(setMazePosition({ x: newX, y: newY }));
    setMoves((prev) => prev + 1);

    // Проверка достижения цели
    if (targetCell.type === "finish") {
      playSound("complete");
      setIsGameComplete(true);

      // Начисление очков
      const timeBonus = Math.max(0, 60 - gameTime);
      const moveBonus = Math.max(0, 30 - moves);
      const totalPoints = 150 + timeBonus + moveBonus;
      dispatch(addScore(totalPoints));

      if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200, 100, 200]);
      }
    }
  };

  /**
   * Обработка клавиш
   */
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isGameComplete) return;

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          movePlayer("up");
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          movePlayer("down");
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          movePlayer("left");
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          movePlayer("right");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [playerPos, isGameComplete]);

  /**
   * Получение стиля ячейки
   */
  const getCellStyle = (cell: MazeCell) => {
    const isPlayer = cell.x === playerPos.x && cell.y === playerPos.y;

    if (isPlayer) {
      return "bg-blue-500 border-blue-600 animate-pulse";
    }

    switch (cell.type) {
      case "wall":
        return "bg-gray-800 border-gray-900";
      case "path":
        return "bg-green-100 border-green-200";
      case "start":
        return "bg-blue-200 border-blue-300";
      case "finish":
        return "bg-yellow-300 border-yellow-400 animate-pulse";
      case "obstacle":
        return "bg-red-400 border-red-500"; // Бомба
      default:
        return "bg-gray-200 border-gray-300";
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
    generateMaze();
    setIsGameComplete(false);
    setMoves(0);
    setShowNotification(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `url(${mazeBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Заголовок */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <Navigation className="text-gray-600 mr-3" size={32} />
            <h1 className="text-4xl font-bold text-gray-800">Лабиринт</h1>
            <Navigation className="text-gray-600 ml-3" size={32} />
          </div>
          <p className="text-xl text-gray-600">
            Проведи персонажа к выходу из лабиринта!
          </p>
        </div>

        {/* Статистика */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Navigation className="text-blue-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Ходы</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{moves}</p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Target className="text-green-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Время</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {formatTime(gameTime)}
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Trophy className="text-yellow-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Очки</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{score}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Лабиринт */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
              <div className="grid grid-cols-8 gap-1 aspect-square max-w-md mx-auto">
                {maze.flat().map((cell, index) => (
                  <div
                    key={index}
                    className={`
                      aspect-square border-2 rounded-sm transition-all duration-200
                      ${getCellStyle(cell)}
                    `}
                  >
                    {cell.type === "finish" &&
                      cell.x !== playerPos.x &&
                      cell.y !== playerPos.y && (
                        <div className="w-full h-full flex items-center justify-center">
                          <Target size={12} className="text-yellow-700" />
                        </div>
                      )}
                    {cell.type === "obstacle" &&
                      cell.x !== playerPos.x &&
                      cell.y !== playerPos.y && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-base">💣</span>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Управление */}
          <div className="space-y-6">
            {/* Кнопки управления */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
                Управление
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <div></div>
                <button
                  onClick={() => {
                    playSound("move");
                    movePlayer("up");
                  }}
                  disabled={isGameComplete}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ArrowUp size={20} className="mx-auto" />
                </button>
                <div></div>

                <button
                  onClick={() => {
                    playSound("move");
                    movePlayer("left");
                  }}
                  disabled={isGameComplete}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ArrowLeft size={20} className="mx-auto" />
                </button>
                <div></div>
                <button
                  onClick={() => {
                    playSound("move");
                    movePlayer("right");
                  }}
                  disabled={isGameComplete}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ArrowRight size={20} className="mx-auto" />
                </button>

                <div></div>
                <button
                  onClick={() => {
                    playSound("move");
                    movePlayer("down");
                  }}
                  disabled={isGameComplete}
                  className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ArrowDown size={20} className="mx-auto" />
                </button>
                <div></div>
              </div>
            </div>

            {/* Легенда */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-4">
                Обозначения:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                  <span>Ты</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-300 rounded mr-2"></div>
                  <span>Выход</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
                  <span>Путь</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-400 border border-red-500 rounded mr-2 flex items-center justify-center">
                    <span className="text-xs">💣</span>
                  </div>
                  <span>Бомба (-10 очков)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-gray-800 rounded mr-2"></div>
                  <span>Стена</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Модальное окно с результатом */}
        <GameNotification
          isVisible={showNotification}
          type="success"
          title="Поздравляем!"
          message={`Лабиринт пройден за ${formatTime(gameTime)}! Количество ходов: ${moves}`}
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
