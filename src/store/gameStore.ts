/**
 * @fileoverview Redux store для управления состоянием игры Смешарики
 * Содержит логику управления персонажами, этапами, наградами и прогрессом игры
 */

import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

/**
 * Тип персонажа Смешариков
 */
export type Character = 
  | 'barash' 
  | 'krosh' 
  | 'ezhik' 
  | 'losyash' 
  | 'sovunya' 
  | 'nyusha' 
  | 'pin' 
  | 'kar-karych' 
  | 'kopatych' 
  | 'bibi';

/**
 * Тип награды для каждого персонажа
 */
export type RewardType = 
  | 'stihi'     // стихи для Бараша
  | 'carrot'    // морковки для Кроша
  | 'apple'     // яблоки для Ежика
  | 'formula'   // формулы для Лосяша
  | 'berries'   // ягоды для Совуни
  | 'gear'      // шестеренки для Пина
  | 'planet'    // планеты для Биби
  | 'flower'    // цветы для Нюши
  | 'potato'    // картошка для Копатыча
  | 'notes';    // ноты для Кар-Карыча

/**
 * Этап игры
 */
export type GameStage = 
  | 'intro'        // вступление
  | 'character'    // выбор персонажа
  | 'memory'       // игра на память
  | 'sorting'      // сортировка по корзинам
  | 'puzzle'       // пазл
  | 'odd-one'      // найди лишний
  | 'music'        // музыкальная поляна
  | 'maze'         // лабиринт
  | 'collect'      // собери награды
  | 'victory';     // победа

/**
 * Информация о персонаже
 */
export interface CharacterInfo {
  id: Character;
  name: string;
  reward: RewardType;
  color: string;
  description: string;
}

/**
 * Состояние мини-игры на память
 */
export interface MemoryGameState {
  cards: { id: number; character: Character; isFlipped: boolean; isMatched: boolean }[];
  flippedCards: number[];
  matchedPairs: number;
  attempts: number;
  isGameComplete: boolean;
}

/**
 * Общее состояние игры
 */
export interface GameState {
  currentStage: GameStage;
  selectedCharacter: Character | null;
  score: number;
  collectedRewards: number;
  lives: number;
  isGamePaused: boolean;
  completedStages: GameStage[];
  memoryGame: MemoryGameState;
  musicSequence: Character[];
  playerSequence: Character[];
  mazePosition: { x: number; y: number };
  gameTime: number;
}

/**
 * Информация о всех персонажах Смешариков
 */
export const CHARACTERS: Record<Character, CharacterInfo> = {
  barash: {
    id: 'barash',
    name: 'Бараш',
    reward: 'stihi',
    color: '#E879F9',
    description: 'Поэт и мечтатель, любит стихи'
  },
  krosh: {
    id: 'krosh',
    name: 'Крош',
    reward: 'carrot',
    color: '#60A5FA',
    description: 'Веселый заяц, обожает морковку'
  },
  ezhik: {
    id: 'ezhik',
    name: 'Ежик',
    reward: 'apple',
    color: '#34D399',
    description: 'Серьезный и умный, собирает яблоки'
  },
  losyash: {
    id: 'losyash',
    name: 'Лосяш',
    reward: 'formula',
    color: '#FBBF24',
    description: 'Ученый, изучает формулы'
  },
  sovunya: {
    id: 'sovunya',
    name: 'Совунья',
    reward: 'berries',
    color: '#A78BFA',
    description: 'Мудрая сова, собирает ягоды'
  },
  nyusha: {
    id: 'nyusha',
    name: 'Нюша',
    reward: 'flower',
    color: '#F472B6',
    description: 'Модница, любит цветы'
  },
  pin: {
    id: 'pin',
    name: 'Пин',
    reward: 'gear',
    color: '#6B7280',
    description: 'Изобретатель, чинит шестеренки'
  },
  'kar-karych': {
    id: 'kar-karych',
    name: 'Кар-Карыч',
    reward: 'notes',
    color: '#EF4444',
    description: 'Певец, создает музыкальные ноты'
  },
  kopatych: {
    id: 'kopatych',
    name: 'Копатыч',
    reward: 'potato',
    color: '#92400E',
    description: 'Садовод, выращивает картошку'
  },
  bibi: {
    id: 'bibi',
    name: 'Биби',
    reward: 'planet',
    color: '#7C3AED',
    description: 'Исследователь, изучает планеты'
  }
};

/**
 * Начальное состояние игры
 */
const initialState: GameState = {
  currentStage: 'intro',
  selectedCharacter: null,
  score: 0,
  collectedRewards: 0,
  lives: 3,
  isGamePaused: false,
  completedStages: [],
  memoryGame: {
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    attempts: 0,
    isGameComplete: false
  },
  musicSequence: [],
  playerSequence: [],
  mazePosition: { x: 0, y: 0 },
  gameTime: 0
};

/**
 * Slice для управления состоянием игры
 */
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    /**
     * Переход к следующему этапу игры
     */
    nextStage: (state) => {
      const stages: GameStage[] = [
        'intro', 'character', 'memory', 'sorting', 
        'puzzle', 'odd-one', 'music', 'maze', 'collect', 'victory'
      ];
      const currentIndex = stages.indexOf(state.currentStage);
      if (currentIndex < stages.length - 1) {
        const nextStage = stages[currentIndex + 1];
        state.currentStage = nextStage;
        if (!state.completedStages.includes(nextStage)) {
          state.completedStages.push(nextStage);
        }
      }
    },

    /**
     * Переход к конкретному этапу
     */
    setStage: (state, action: PayloadAction<GameStage>) => {
      state.currentStage = action.payload;
    },

    /**
     * Выбор персонажа
     */
    selectCharacter: (state, action: PayloadAction<Character>) => {
      state.selectedCharacter = action.payload;
    },

    /**
     * Добавление очков
     */
    addScore: (state, action: PayloadAction<number>) => {
      state.score += action.payload;
    },

    /**
     * Добавление наград
     */
    addReward: (state, action: PayloadAction<number>) => {
      state.collectedRewards += action.payload;
      state.score += action.payload * 10; // Бонусные очки за награды
    },

    /**
     * Потеря жизни
     */
    loseLife: (state) => {
      if (state.lives > 0) {
        state.lives--;
      }
    },

    /**
     * Пауза/возобновление игры
     */
    togglePause: (state) => {
      state.isGamePaused = !state.isGamePaused;
    },

    /**
     * Сброс игры к начальному состоянию
     */
    resetGame: (state) => {
      Object.assign(state, initialState);
    },

    /**
     * Инициализация игры на память
     */
    initMemoryGame: (state) => {
      const characters: Character[] = ['barash', 'krosh', 'ezhik', 'losyash', 'sovunya', 'nyusha'];
      const cards = [];
      
      // Создаем пары карт
      for (let i = 0; i < characters.length; i++) {
        cards.push(
          { id: i * 2, character: characters[i], isFlipped: false, isMatched: false },
          { id: i * 2 + 1, character: characters[i], isFlipped: false, isMatched: false }
        );
      }

      // Перемешиваем карты
      for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
      }

      state.memoryGame = {
        cards,
        flippedCards: [],
        matchedPairs: 0,
        attempts: 0,
        isGameComplete: false
      };
    },

    /**
     * Переворот карты в игре на память
     */
    flipCard: (state, action: PayloadAction<number>) => {
      const cardId = action.payload;
      const card = state.memoryGame.cards.find(c => c.id === cardId);
      
      if (!card || card.isFlipped || card.isMatched || state.memoryGame.flippedCards.length >= 2) {
        return;
      }

      card.isFlipped = true;
      state.memoryGame.flippedCards.push(cardId);

      if (state.memoryGame.flippedCards.length === 2) {
        state.memoryGame.attempts++;
        const [firstId, secondId] = state.memoryGame.flippedCards;
        const firstCard = state.memoryGame.cards.find(c => c.id === firstId);
        const secondCard = state.memoryGame.cards.find(c => c.id === secondId);

        if (firstCard && secondCard && firstCard.character === secondCard.character) {
          // Найдена пара
          firstCard.isMatched = true;
          secondCard.isMatched = true;
          state.memoryGame.matchedPairs++;
          state.memoryGame.flippedCards = [];
          
          // Добавляем очки за найденную пару
          state.score += 20;
          
          // Проверяем завершение игры
          if (state.memoryGame.matchedPairs === 6) {
            state.memoryGame.isGameComplete = true;
            state.score += 100; // Бонус за завершение
          }
        }
      }
    },

    /**
     * Сброс перевернутых карт (если пара не найдена)
     */
    resetFlippedCards: (state) => {
      state.memoryGame.flippedCards.forEach(cardId => {
        const card = state.memoryGame.cards.find(c => c.id === cardId);
        if (card && !card.isMatched) {
          card.isFlipped = false;
        }
      });
      state.memoryGame.flippedCards = [];
    },

    /**
     * Установка музыкальной последовательности
     */
    setMusicSequence: (state, action: PayloadAction<Character[]>) => {
      state.musicSequence = action.payload;
      state.playerSequence = [];
    },

    /**
     * Добавление ноты в последовательность игрока
     */
    addPlayerNote: (state, action: PayloadAction<Character>) => {
      state.playerSequence.push(action.payload);
    },

    /**
     * Сброс последовательности игрока
     */
    resetPlayerSequence: (state) => {
      state.playerSequence = [];
    },

    /**
     * Установка позиции в лабиринте
     */
    setMazePosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.mazePosition = action.payload;
    },

    /**
     * Обновление времени игры
     */
    updateGameTime: (state, action: PayloadAction<number>) => {
      state.gameTime = action.payload;
    },

    /**
     * Автоматический переход на главный экран по таймауту
     */
    autoReturnToMain: (state) => {
      state.currentStage = 'intro';
      state.selectedCharacter = null;
      state.score = 0;
      state.gameTime = 0;
      state.collectedRewards = 0;
      
      // Сброс всех игровых состояний
      state.memoryGame = {
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        attempts: 0,
        isGameComplete: false
      };
      
      state.musicSequence = [];
      state.playerSequence = [];
    }
  }
});

export const {
  nextStage,
  setStage,
  selectCharacter,
  addScore,
  addReward,
  loseLife,
  togglePause,
  resetGame,
  initMemoryGame,
  flipCard,
  resetFlippedCards,
  setMusicSequence,
  addPlayerNote,
  resetPlayerSequence,
  setMazePosition,
  updateGameTime,
  autoReturnToMain
} = gameSlice.actions;

/**
 * Конфигурация store
 */
export const store = configureStore({
  reducer: {
    game: gameSlice.reducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;