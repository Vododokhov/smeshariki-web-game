/**
 * @fileoverview Компонент анимированного перехода между этапами игры
 */

import React, { useEffect, useState } from 'react';

interface StageTransitionProps {
  children: React.ReactNode;
  stage: string;
}

/**
 * Компонент для плавных анимированных переходов между этапами
 */
export const StageTransition: React.FC<StageTransitionProps> = ({ children, stage }) => {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentStage, setCurrentStage] = useState(stage);

  useEffect(() => {
    if (stage !== currentStage) {
      setIsTransitioning(true);
      
      const timer = setTimeout(() => {
        setCurrentStage(stage);
        setIsTransitioning(false);
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [stage, currentStage]);

  return (
    <div className="relative w-full h-full">
      {/* Overlay для перехода */}
      <div
        className={`
          fixed inset-0 bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30 
          backdrop-blur-sm z-[100] transition-opacity duration-300
          ${isTransitioning ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent" />
        </div>
      </div>

      {/* Контент с анимацией */}
      <div
        className={`
          transition-all duration-300 ease-out
          ${isTransitioning 
            ? 'opacity-0 scale-95 blur-sm' 
            : 'opacity-100 scale-100 blur-0'
          }
        `}
      >
        {children}
      </div>
    </div>
  );
};
