/**
 * @fileoverview Всплывающее модальное окно для уведомлений
 */

import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  showCloseButton = false 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Оверлей */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={showCloseButton ? onClose : undefined}
      />
      
      {/* Модальное окно */}
      <div className="relative bg-white rounded-2xl p-6 m-4 max-w-md w-full shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300">
        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        )}
        
        {children}
      </div>
    </div>
  );
};