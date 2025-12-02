/**
 * @fileoverview Основной контейнер игры
 * Управляет переключением между этапами и отображает текущий экран
 */

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, updateGameTime, resetGame } from '../store/gameStore';
// import { ScoreBoard } from './ScoreBoard';
import { IntroStage } from './stages/IntroStage';
import { CharacterSelectStage } from './stages/CharacterSelectStage';
import { MemoryGameStage } from './stages/MemoryGameStage';
import { SortingGameStage } from './stages/SortingGameStage';
import { PuzzleGameStage } from './stages/PuzzleGameStage';
import { OddOneOutStage } from './stages/OddOneOutStage';
import { MusicGameStage } from './stages/MusicGameStage';
import { MazeGameStage } from './stages/MazeGameStage';
import { CollectGameStage } from './stages/CollectGameStage';
import { StageTransition } from './StageTransition';
import { useSound } from './SoundManager';
import { GameButton } from './GameButton';
import { Trophy } from 'lucide-react';

/**
 * Страница победы
 */
const VictoryStage: React.FC = () => {
  const dispatch = useDispatch();
  const { score } = useSelector((state: RootState) => state.game);
  const { playSound } = useSound();

  const handleRestart = () => {
    playSound('click');
    dispatch(resetGame());
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400">
      <div className="text-center text-white p-8 max-w-lg">
        <div className="animate-scale-in">
          <div className="flex items-center justify-center mb-6">
            <Trophy className="text-yellow-300 mr-3" size={64} />
            <h2 className="text-5xl font-bold">Победа!</h2>
            <Trophy className="text-yellow-300 ml-3" size={64} />
          </div>
          <p className="text-2xl mb-4">Поздравляем с завершением игры!</p>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
            <p className="text-3xl font-bold">Итоговый счет: {score}</p>
          </div>
          <GameButton
            onClick={handleRestart}
            variant="success"
            size="large"
            className="text-xl px-10 py-5"
          >
            Начать игру заново
          </GameButton>
        </div>
      </div>
    </div>
  );
};

/**
 * Основной контейнер игры
 * Отображает соответствующий компонент в зависимости от текущего этапа
 */
export const GameContainer: React.FC = () => {
  const dispatch = useDispatch();
  const { currentStage, gameTime } = useSelector((state: RootState) => state.game);
  const { playBackgroundMusic, stopBackgroundMusic } = useSound();

  // Таймер игры
  useEffect(() => {
    const timer = setInterval(() => {
      dispatch(updateGameTime(gameTime + 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [dispatch, gameTime]);

  // Фоновая музыка убрана по запросу пользователя

  /**
   * Рендер текущего этапа игры
   */
  const renderCurrentStage = () => {
    switch (currentStage) {
      case 'intro':
        return <IntroStage />;
      
      case 'character':
        return <CharacterSelectStage />;
      
      case 'memory':
        return <MemoryGameStage />;
      
      case 'sorting':
        return <SortingGameStage />;
      
      case 'puzzle':
        return <PuzzleGameStage />;
      
      case 'odd-one':
        return <OddOneOutStage />;
      
      case 'music':
        return <MusicGameStage />;
      
      case 'maze':
        return <MazeGameStage />;
      
      case 'collect':
        return <CollectGameStage />;
      
      case 'victory':
        return <VictoryStage />;
      
      default:
        return <IntroStage />;
    }
  };

  return (
    <div className="min-h-screen" onContextMenu={(e) => e.preventDefault()}>
      {/* Панель счета - показываем после выбора персонажа */}
      {/* {currentStage !== 'intro' && currentStage !== 'character' && (
        <div className="fixed top-4 left-4 right-4 z-50">
          <ScoreBoard />
        </div>
      )} */}

      {/* Основной контент с анимированными переходами */}
      <StageTransition stage={currentStage}>
        <div className={currentStage !== 'intro' && currentStage !== 'character' ? '' : ''}>
          {renderCurrentStage()}
        </div>
      </StageTransition>
    </div>
  );
};