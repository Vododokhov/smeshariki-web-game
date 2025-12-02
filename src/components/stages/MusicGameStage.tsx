/**
 * @fileoverview Компонент музыкальной игры - "Музыкальная поляна"
 * Игрок должен повторить музыкальную последовательность
 */

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  RootState,
  addScore,
  nextStage,
  setMusicSequence,
  addPlayerNote,
  resetPlayerSequence,
  Character,
} from "../../store/gameStore";
import { GameButton } from "../GameButton";
import { GameNotification } from "../GameNotification";
import { Music, Volume2, Trophy } from "lucide-react";
import { useSound } from "../SoundManager";

// Импорт фонового изображения
import musicBgImg from "../../assets/backgrounds/music-bg.jpg";

// Импорты изображений персонажей для музыкальных кнопок
import barashImg from "../../assets/characters/barash.png";
import kroshImg from "../../assets/characters/krosh.png";
import ezhikImg from "../../assets/characters/ezhik.png";
import losyashImg from "../../assets/characters/losyash.png";
import sovunyaImg from "../../assets/characters/sovunya.png";
import nyushaImg from "../../assets/characters/nyusha.png";

/**
 * Маппинг персонажей на изображения и звуки
 */
const musicCharacters = {
  barash: {
    img: barashImg,
    sound: "piano",
    color: "bg-purple-200 hover:bg-purple-300",
    name: "Бараш",
  },
  krosh: {
    img: kroshImg,
    sound: "drum",
    color: "bg-blue-200 hover:bg-blue-300",
    name: "Крош",
  },
  ezhik: {
    img: ezhikImg,
    sound: "flute",
    color: "bg-green-200 hover:bg-green-300",
    name: "Ежик",
  },
  losyash: {
    img: losyashImg,
    sound: "guitar",
    color: "bg-yellow-200 hover:bg-yellow-300",
    name: "Лосяш",
  },
  sovunya: {
    img: sovunyaImg,
    sound: "violin",
    color: "bg-indigo-200 hover:bg-indigo-300",
    name: "Совунья",
  },
  nyusha: {
    img: nyushaImg,
    sound: "bell",
    color: "bg-pink-200 hover:bg-pink-300",
    name: "Нюша",
  },
};

type MusicCharacter = keyof typeof musicCharacters;

/**
 * Музыкальная игра на память и слух
 */
export const MusicGameStage: React.FC = () => {
  const dispatch = useDispatch();
  const { score, musicSequence, playerSequence } = useSelector(
    (state: RootState) => state.game
  );
  const { playSound: playSoundEffect } = useSound();

  const [gameState, setGameState] = useState<
    "waiting" | "showing" | "playing" | "complete"
  >("waiting");
  const [currentLevel, setCurrentLevel] = useState(1);
  const [showingIndex, setShowingIndex] = useState(-1);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [score_local, setScore_local] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [showSkipButton, setShowSkipButton] = useState(true);

  /**
   * Начать новый уровень
   */
  const startLevel = () => {
    const characters = Object.keys(musicCharacters) as MusicCharacter[];
    const sequence: Character[] = [];

    // Генерируем последовательность (длина = уровень + 2)
    for (let i = 0; i < currentLevel + 2; i++) {
      const randomChar =
        characters[Math.floor(Math.random() * characters.length)];
      sequence.push(randomChar);
    }

    dispatch(setMusicSequence(sequence));
    setGameState("showing");
    setShowingIndex(0);
  };

  /**
   * Показ последовательности
   */
  useEffect(() => {
    if (
      gameState === "showing" &&
      showingIndex >= 0 &&
      showingIndex < musicSequence.length
    ) {
      const character = musicSequence[showingIndex];
      const soundType = musicCharacters[character as MusicCharacter].sound;
      playSoundEffect(soundType as never);

      const timer = setTimeout(() => {
        if (showingIndex < musicSequence.length - 1) {
          setShowingIndex(showingIndex + 1);
        } else {
          setGameState("playing");
          setShowingIndex(-1);
        }
      }, 800);

      return () => clearTimeout(timer);
    }
  }, [gameState, showingIndex, musicSequence, playSoundEffect]);

  /**
   * Обработка нажатия на персонажа
   */
  const handleCharacterClick = (character: MusicCharacter) => {
    if (gameState !== "playing") return;

    // Звуковая обратная связь
    playSound(character);

    // Вибрация
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }

    dispatch(addPlayerNote(character));
  };

  /**
   * Проверка последовательности после каждого хода игрока
   */
  useEffect(() => {
    if (gameState === "playing" && playerSequence.length > 0) {
      const currentIndex = playerSequence.length - 1;
      const isCorrect =
        playerSequence[currentIndex] === musicSequence[currentIndex];

      if (!isCorrect) {
        // Неправильная нота - игра окончена
        setGameState("complete");
        setShowFailureModal(true);
        if (navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
        return;
      }

      if (playerSequence.length === musicSequence.length) {
        // Уровень пройден
        const levelScore = currentLevel * 25;
        dispatch(addScore(levelScore));
        setScore_local((prev) => prev + levelScore);

        dispatch(resetPlayerSequence());

        if (currentLevel >= 5) {
          // Игра завершена
          setIsGameComplete(true);
          setGameState("complete");
          setShowCompletionModal(true);
          dispatch(addScore(100)); // Бонус за завершение
        } else {
          // Следующий уровень
          setCurrentLevel((prev) => prev + 1);
          setTimeout(() => {
            setGameState("waiting");
          }, 1000);
        }
      }
    }
  }, [playerSequence, musicSequence, gameState, currentLevel, dispatch]);

  /**
   * Воспроизведение звука
   */
  const playSound = (character: MusicCharacter) => {
    const soundType = musicCharacters[character].sound;
    playSoundEffect(soundType as never);
  };

  /**
   * Переход к следующему этапу
   */
  const handleContinue = () => {
    setShowCompletionModal(false);
    setShowFailureModal(false);
    dispatch(nextStage());
  };

  /**
   * Перезапуск игры
   */
  const handleRestart = () => {
    setShowCompletionModal(false);
    setShowFailureModal(false);
    setCurrentLevel(1);
    setGameState("waiting");
    setIsGameComplete(false);
    setScore_local(0);
    dispatch(resetPlayerSequence());
  };

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundImage: `url(${musicBgImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Заголовок */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-4">
            <h1 className="text-4xl font-bold text-gray-800">
              Музыкальная поляна
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            Послушай мелодию и повтори её!
          </p>
        </div>

        {/* Статистика */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-3">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center mb-2">
                <Volume2 className="text-purple-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Уровень</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {currentLevel}/5
              </p>
            </div>

            <div>
              <div className="flex items-center justify-center mb-2">
                <Music className="text-green-500 mr-1" size={20} />
                <span className="font-bold text-gray-700">Нот в мелодии</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {musicSequence.length}
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
        {/* Статус игры */}
        <div className="text-center mb-6">
          {gameState === "waiting" && (
            <div className="bg-blue-100 border-2 border-blue-300 rounded-2xl p-4">
              <h3 className="text-xl font-bold text-blue-800 mb-2">
                Уровень {currentLevel}
              </h3>
              <p className="text-blue-700">
                Приготовься слушать мелодию из {currentLevel + 2} нот!
              </p>
            </div>
          )}

          {gameState === "showing" && (
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-2xl p-4">
              <h3 className="text-xl font-bold text-yellow-800 mb-2">
                Слушай внимательно!
              </h3>
              <p className="text-yellow-700">
                Нота {showingIndex + 1} из {musicSequence.length}
              </p>
            </div>
          )}

          {gameState === "playing" && (
            <div className="bg-green-100 border-2 border-green-300 rounded-2xl p-4">
              <h3 className="text-xl font-bold text-green-800 mb-2">
                Повтори мелодию!
              </h3>
              <p className="text-green-700">
                Нажато: {playerSequence.length} из {musicSequence.length}
              </p>
            </div>
          )}
        </div>

        {/* Музыкальные кнопки */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {Object.entries(musicCharacters).map(([character, info]) => (
            <button
              key={character}
              onClick={() => handleCharacterClick(character as MusicCharacter)}
              disabled={gameState === "showing"}
              className={`
                ${info.color} p-2 rounded-2xl border-4 border-white shadow-lg
                transition-all duration-200 transform
                ${
                  gameState === "playing"
                    ? "hover:scale-110 cursor-pointer"
                    : "cursor-not-allowed opacity-70"
                }
                ${
                  gameState === "showing" &&
                  showingIndex >= 0 &&
                  musicSequence[showingIndex] === character
                    ? "scale-110 ring-4 ring-yellow-400 animate-pulse"
                    : ""
                }
                active:scale-95
              `}
            >
              <div className="text-center">
                <img
                  src={info.img}
                  alt={info.name}
                  className="w-32 h-32 mx-auto mb-3 object-contain"
                />
                <h3 className="font-bold text-gray-800 text-lg">{info.name}</h3>
                <p className="text-gray-600 text-sm">{info.sound}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Кнопки управления */}
        <div className="text-center space-y-4">
          {gameState === "waiting" && (
            <GameButton
              onClick={startLevel}
              variant="primary"
              size="large"
              className="text-xl px-8 py-4"
            >
              Начать уровень {currentLevel}
            </GameButton>
          )}
          {/* Кнопка пропустить */}
          {showSkipButton && !showCompletionModal && !showFailureModal && (
            <GameButton
              onClick={() => {
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

          {gameState === "complete" &&
            !showCompletionModal &&
            !showFailureModal && (
              <div className="space-x-4">
                <GameButton
                  onClick={() => {
                    setCurrentLevel(currentLevel);
                    setGameState("waiting");
                    dispatch(resetPlayerSequence());
                  }}
                  variant="secondary"
                  size="medium"
                >
                  Переиграть уровень
                </GameButton>

                <GameButton
                  onClick={handleRestart}
                  variant="secondary"
                  size="medium"
                >
                  Начать заново
                </GameButton>
              </div>
            )}
        </div>

        {/* Модальное окно завершения игры */}
        <GameNotification
          isVisible={showCompletionModal}
          type="success"
          title="Победа!"
          message={`Все уровни пройдены! Заработано ${score_local} очков!`}
          score={score}
          onContinue={handleContinue}
          // onSkip={handleContinue}
          onRestart={handleRestart}
          showContinueButton={true}
          showSkipButton={true}
          showRestartButton={true}
        />

        {/* Модальное окно провала */}
        <GameNotification
          isVisible={showFailureModal}
          type="failure"
          title="Попробуй еще раз!"
          message={`Достигнут уровень ${currentLevel}. Заработано ${score_local} очков.`}
          score={score}
          onContinue={handleContinue}
          onSkip={handleContinue}
          onRestart={handleRestart}
          showContinueButton={false}
          showSkipButton={true}
          showRestartButton={true}
        />
      </div>
    </div>
  );
};
