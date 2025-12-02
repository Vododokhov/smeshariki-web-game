/**
 * @fileoverview Менеджер звуковых эффектов для игры
 * Обеспечивает воспроизведение звуков и музыки с поддержкой Web Audio API
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface SoundContextType {
  playSound: (soundType: SoundType) => void;
  toggleMute: () => void;
  isMuted: boolean;
  volume: number;
  setVolume: (volume: number) => void;
  playBackgroundMusic: (stage: GameStage) => void;
  stopBackgroundMusic: () => void;
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
}

type GameStage = 'intro' | 'character' | 'memory' | 'sorting' | 'puzzle' | 'odd-one' | 'music' | 'maze' | 'collect' | 'victory';

type SoundType = 
  | 'click' 
  | 'success' 
  | 'error' 
  | 'collect' 
  | 'flip' 
  | 'match' 
  | 'complete' 
  | 'move'
  | 'piano'
  | 'drum'
  | 'flute'
  | 'guitar'
  | 'violin'
  | 'bell'
  | 'start'
  | 'fail'
  | 'pickup';

const SoundContext = createContext<SoundContextType | null>(null);

/**
 * Провайдер звукового контекста
 */
export const SoundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolumeState] = useState(0.7);
  const [musicVolume, setMusicVolumeState] = useState(0.4);

  /**
   * Генерация звука с использованием Web Audio API
   */
  const generateSound = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (isMuted) return;

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(volume * 0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Web Audio API не поддерживается:', error);
    }
  }, [isMuted, volume]);

  /**
   * Воспроизведение звука по типу
   */
  const playSound = useCallback((soundType: SoundType) => {
    switch (soundType) {
      case 'click':
        generateSound(800, 0.1, 'square');
        break;
      case 'success':
        // Последовательность нот для успеха
        generateSound(523, 0.1); // C
        setTimeout(() => generateSound(659, 0.1), 100); // E
        setTimeout(() => generateSound(784, 0.2), 200); // G
        break;
      case 'error':
        generateSound(200, 0.3, 'square');
        break;
      case 'collect':
        generateSound(1047, 0.1, 'triangle');
        setTimeout(() => generateSound(1319, 0.1, 'triangle'), 50);
        break;
      case 'flip':
        generateSound(600, 0.1, 'triangle');
        break;
      case 'match':
        generateSound(440, 0.1); // A
        setTimeout(() => generateSound(554, 0.2), 100); // C#
        break;
      case 'complete':
        // Мелодия победы
        [523, 659, 784, 1047].forEach((freq, i) => {
          setTimeout(() => generateSound(freq, 0.2), i * 100);
        });
        break;
      case 'move':
        generateSound(400, 0.05, 'square');
        break;
      case 'piano':
        generateSound(523, 0.3, 'triangle'); // C
        break;
      case 'drum':
        generateSound(80, 0.1, 'square');
        break;
      case 'flute':
        generateSound(659, 0.4, 'sine'); // E
        break;
      case 'guitar':
        generateSound(330, 0.3, 'sawtooth'); // E
        break;
      case 'violin':
        generateSound(440, 0.4, 'triangle'); // A
        break;
      case 'bell':
        generateSound(1047, 0.3, 'sine'); // C
        setTimeout(() => generateSound(1319, 0.2, 'sine'), 100); // E
        break;
    }
  }, [generateSound]);

  /**
   * Переключение звука
   */
  const toggleMute = useCallback(() => {
    setIsMuted(prev => !prev);
  }, []);

  /**
   * Установка громкости
   */
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  const setMusicVolume = useCallback((newVolume: number) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    setMusicVolumeState(vol);
  }, []);

  /**
   * Заглушка для фоновой музыки (убрана по запросу)
   */
  const playBackgroundMusic = useCallback((stage: GameStage) => {
    // Функционал убран
  }, []);

  /**
   * Заглушка для остановки фоновой музыки (убрана по запросу)
   */
  const stopBackgroundMusic = useCallback(() => {
    // Функционал убран
  }, []);


  const value: SoundContextType = {
    playSound,
    toggleMute,
    isMuted,
    volume,
    setVolume,
    playBackgroundMusic,
    stopBackgroundMusic,
    musicVolume,
    setMusicVolume
  };

  return (
    <SoundContext.Provider value={value}>
      {children}
    </SoundContext.Provider>
  );
};

/**
 * Хук для использования звукового контекста
 */
export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSound должен использоваться внутри SoundProvider');
  }
  return context;
};

/**
 * Компонент управления звуком
 */
export const SoundControls: React.FC = () => {
  const { toggleMute, isMuted, volume, setVolume } = useSound();

  return (
    <div className="fixed top-4 right-4 z-50 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleMute}
          className={`
            p-2 rounded-lg transition-all duration-200 active:scale-95
            ${isMuted 
              ? 'bg-destructive/20 text-destructive hover:bg-destructive/30' 
              : 'bg-primary/20 text-primary hover:bg-primary/30'
            }
          `}
          aria-label={isMuted ? 'Включить звук' : 'Выключить звук'}
        >
          <span className="text-xl">{isMuted ? '🔇' : '🔊'}</span>
        </button>
      </div>
    </div>
  );
};