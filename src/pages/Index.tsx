/**
 * @fileoverview Главная страница игры "Мир приключений Смешариков"
 * Точка входа в игру с инициализацией Redux store
 */

import React from 'react';
import { Provider } from 'react-redux';
import { store } from '../store/gameStore';
import { GameContainer } from '../components/GameContainer';
import { SoundProvider, SoundControls } from '../components/SoundManager';
import { AchievementProvider, AchievementNotification } from '../components/AchievementSystem';
import { AutoReturnTimer } from '../components/AutoReturnTimer';

/**
 * Главная страница игры
 * Предоставляет Redux store для всего приложения
 */
const Index = () => {
  return (
    <Provider store={store}>
      <SoundProvider>
        <AchievementProvider>
          <div className="min-h-screen">
            <AutoReturnTimer />
            <SoundControls />
            <GameContainer />
            <AchievementNotification />
          </div>
        </AchievementProvider>
      </SoundProvider>
    </Provider>
  );
};

export default Index;
