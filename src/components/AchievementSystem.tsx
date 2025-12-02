/**
 * @fileoverview Система достижений для игры Смешарики
 * Отслеживает прогресс игрока и награждает за различные достижения
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { Trophy, Medal, Star, Award, Crown, Zap } from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  requirement: number;
  progress: number;
  unlocked: boolean;
  category: 'speed' | 'accuracy' | 'collection' | 'completion' | 'special';
  points: number;
}

interface AchievementState {
  achievements: Achievement[];
  totalPoints: number;
  level: number;
  newUnlocks: Achievement[];
}

type AchievementAction =
  | { type: 'UPDATE_PROGRESS'; achievementId: string; progress: number }
  | { type: 'UNLOCK_ACHIEVEMENT'; achievementId: string }
  | { type: 'CLEAR_NEW_UNLOCKS' }
  | { type: 'RESET_ACHIEVEMENTS' };

interface AchievementContextType {
  state: AchievementState;
  updateProgress: (achievementId: string, progress: number) => void;
  checkAndUnlock: (achievementId: string) => void;
  clearNewUnlocks: () => void;
  resetAchievements: () => void;
}

/**
 * Определение всех достижений
 */
const INITIAL_ACHIEVEMENTS: Achievement[] = [
  // Достижения скорости
  {
    id: 'speed_memory_30',
    title: 'Молниеносная память',
    description: 'Завершите игру на память менее чем за 30 секунд',
    icon: Zap,
    requirement: 1,
    progress: 0,
    unlocked: false,
    category: 'speed',
    points: 50
  },
  {
    id: 'speed_puzzle_60',
    title: 'Мастер пазлов',
    description: 'Соберите пазл менее чем за 60 секунд',
    icon: Medal,
    requirement: 1,
    progress: 0,
    unlocked: false,
    category: 'speed',
    points: 30
  },
  {
    id: 'speed_maze_45',
    title: 'Проводник лабиринта',
    description: 'Пройдите лабиринт менее чем за 45 секунд',
    icon: Star,
    requirement: 1,
    progress: 0,
    unlocked: false,
    category: 'speed',
    points: 40
  },

  // Достижения точности
  {
    id: 'accuracy_memory_perfect',
    title: 'Идеальная память',
    description: 'Завершите игру на память без ошибок',
    icon: Trophy,
    requirement: 1,
    progress: 0,
    unlocked: false,
    category: 'accuracy',
    points: 75
  },
  {
    id: 'accuracy_sorting_perfect',
    title: 'Точная сортировка',
    description: 'Отсортируйте все предметы правильно с первого раза',
    icon: Award,
    requirement: 1,
    progress: 0,
    unlocked: false,
    category: 'accuracy',
    points: 60
  },
  {
    id: 'accuracy_music_level5',
    title: 'Музыкальный гений',
    description: 'Достигните 5 уровня в музыкальной игре',
    icon: Crown,
    requirement: 1,
    progress: 0,
    unlocked: false,
    category: 'accuracy',
    points: 100
  },

  // Достижения сбора
  {
    id: 'collect_rewards_50',
    title: 'Собиратель',
    description: 'Соберите 50 наград в финальной игре',
    icon: Star,
    requirement: 50,
    progress: 0,
    unlocked: false,
    category: 'collection',
    points: 40
  },
  {
    id: 'collect_target_30',
    title: 'Целевой коллекционер',
    description: 'Соберите 30 целевых наград в финальной игре',
    icon: Trophy,
    requirement: 30,
    progress: 0,
    unlocked: false,
    category: 'collection',
    points: 80
  },

  // Достижения завершения
  {
    id: 'complete_all_stages',
    title: 'Покоритель мира Смешариков',
    description: 'Завершите все этапы игры',
    icon: Crown,
    requirement: 1,
    progress: 0,
    unlocked: false,
    category: 'completion',
    points: 150
  },
  {
    id: 'complete_with_character',
    title: 'Верный спутник',
    description: 'Завершите игру с любым персонажем',
    icon: Medal,
    requirement: 1,
    progress: 0,
    unlocked: false,
    category: 'completion',
    points: 25
  },

  // Специальные достижения
  {
    id: 'special_no_mistakes',
    title: 'Безупречность',
    description: 'Пройдите всю игру без единой ошибки',
    icon: Crown,
    requirement: 1,
    progress: 0,
    unlocked: false,
    category: 'special',
    points: 200
  },
  {
    id: 'special_high_score',
    title: 'Рекордсмен',
    description: 'Наберите более 1000 очков',
    icon: Trophy,
    requirement: 1000,
    progress: 0,
    unlocked: false,
    category: 'special',
    points: 100
  }
];

const initialState: AchievementState = {
  achievements: INITIAL_ACHIEVEMENTS,
  totalPoints: 0,
  level: 1,
  newUnlocks: []
};

/**
 * Редюсер для управления достижениями
 */
const achievementReducer = (state: AchievementState, action: AchievementAction): AchievementState => {
  switch (action.type) {
    case 'UPDATE_PROGRESS': {
      const updatedAchievements = state.achievements.map(achievement => {
        if (achievement.id === action.achievementId) {
          const newProgress = Math.min(achievement.requirement, action.progress);
          return { ...achievement, progress: newProgress };
        }
        return achievement;
      });

      return { ...state, achievements: updatedAchievements };
    }

    case 'UNLOCK_ACHIEVEMENT': {
      const achievement = state.achievements.find(a => a.id === action.achievementId);
      if (!achievement || achievement.unlocked) return state;

      const updatedAchievements = state.achievements.map(a =>
        a.id === action.achievementId ? { ...a, unlocked: true } : a
      );

      const newTotalPoints = state.totalPoints + achievement.points;
      const newLevel = Math.floor(newTotalPoints / 100) + 1;

      return {
        ...state,
        achievements: updatedAchievements,
        totalPoints: newTotalPoints,
        level: newLevel,
        newUnlocks: [...state.newUnlocks, achievement]
      };
    }

    case 'CLEAR_NEW_UNLOCKS':
      return { ...state, newUnlocks: [] };

    case 'RESET_ACHIEVEMENTS':
      return { ...initialState, achievements: INITIAL_ACHIEVEMENTS };

    default:
      return state;
  }
};

const AchievementContext = createContext<AchievementContextType | null>(null);

/**
 * Провайдер системы достижений
 */
export const AchievementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(achievementReducer, initialState);

  const updateProgress = useCallback((achievementId: string, progress: number) => {
    dispatch({ type: 'UPDATE_PROGRESS', achievementId, progress });
  }, []);

  const checkAndUnlock = useCallback((achievementId: string) => {
    const achievement = state.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked && achievement.progress >= achievement.requirement) {
      dispatch({ type: 'UNLOCK_ACHIEVEMENT', achievementId });
    }
  }, [state.achievements]);

  const clearNewUnlocks = useCallback(() => {
    dispatch({ type: 'CLEAR_NEW_UNLOCKS' });
  }, []);

  const resetAchievements = useCallback(() => {
    dispatch({ type: 'RESET_ACHIEVEMENTS' });
  }, []);

  const value: AchievementContextType = {
    state,
    updateProgress,
    checkAndUnlock,
    clearNewUnlocks,
    resetAchievements
  };

  return (
    <AchievementContext.Provider value={value}>
      {children}
    </AchievementContext.Provider>
  );
};

/**
 * Хук для использования системы достижений
 */
export const useAchievements = () => {
  const context = useContext(AchievementContext);
  if (!context) {
    throw new Error('useAchievements должен использоваться внутри AchievementProvider');
  }
  return context;
};

/**
 * Компонент уведомления о новом достижении
 */
export const AchievementNotification: React.FC = () => {
  const { state, clearNewUnlocks } = useAchievements();

  if (state.newUnlocks.length === 0) return null;

  const achievement = state.newUnlocks[0];
  const IconComponent = achievement.icon;

  return (
    <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 animate-scale-in">
      <div className="bg-yellow-100 border-4 border-yellow-400 rounded-2xl p-6 shadow-2xl max-w-sm">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <IconComponent className="text-yellow-800" size={32} />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-yellow-800 mb-2">
            Достижение разблокировано!
          </h2>
          
          <h3 className="text-xl font-semibold text-yellow-700 mb-2">
            {achievement.title}
          </h3>
          
          <p className="text-yellow-600 mb-4">
            {achievement.description}
          </p>
          
          <div className="bg-yellow-200 rounded-lg p-2 mb-4">
            <p className="text-yellow-800 font-bold">
              +{achievement.points} очков достижений
            </p>
          </div>
          
          <button
            onClick={clearNewUnlocks}
            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-800 font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Отлично!
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Панель достижений
 */
export const AchievementPanel: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { state } = useAchievements();

  if (!isOpen) return null;

  const getCategoryColor = (category: Achievement['category']) => {
    switch (category) {
      case 'speed': return 'border-blue-400 bg-blue-50';
      case 'accuracy': return 'border-green-400 bg-green-50';
      case 'collection': return 'border-purple-400 bg-purple-50';
      case 'completion': return 'border-yellow-400 bg-yellow-50';
      case 'special': return 'border-red-400 bg-red-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const unlockedCount = state.achievements.filter(a => a.unlocked).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-4xl max-h-[80vh] overflow-y-auto m-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Достижения</h2>
            <p className="text-gray-600">
              Уровень {state.level} • {state.totalPoints} очков • {unlockedCount}/{state.achievements.length} разблокировано
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {state.achievements.map(achievement => {
            const IconComponent = achievement.icon;
            const progressPercent = (achievement.progress / achievement.requirement) * 100;

            return (
              <div
                key={achievement.id}
                className={`
                  border-2 rounded-lg p-4 transition-all duration-200
                  ${achievement.unlocked 
                    ? getCategoryColor(achievement.category) + ' opacity-100' 
                    : 'border-gray-200 bg-gray-50 opacity-60'
                  }
                `}
              >
                <div className="flex items-center mb-3">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center mr-3
                    ${achievement.unlocked ? 'bg-yellow-400' : 'bg-gray-300'}
                  `}>
                    <IconComponent 
                      className={achievement.unlocked ? 'text-yellow-800' : 'text-gray-500'} 
                      size={24} 
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className={`font-bold ${achievement.unlocked ? 'text-gray-800' : 'text-gray-500'}`}>
                      {achievement.title}
                    </h3>
                    <p className={`text-sm ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}`}>
                      {achievement.points} очков
                    </p>
                  </div>
                </div>

                <p className={`text-sm mb-3 ${achievement.unlocked ? 'text-gray-700' : 'text-gray-500'}`}>
                  {achievement.description}
                </p>

                {!achievement.unlocked && (
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                )}

                {achievement.unlocked && (
                  <div className="text-green-600 font-bold text-sm">
                    ✅ Разблокировано
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};