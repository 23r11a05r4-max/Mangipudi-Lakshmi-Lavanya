import React from 'react';
import { InfoCircleIcon } from './icons';

interface ToastProps {
  message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
  return (
    <div
      role="alert"
      className="fixed top-5 left-1/2 -translate-x-1/2 z-50"
    >
      <div className="flex items-center gap-3 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg shadow-2xl border-2 border-blue-500">
        <InfoCircleIcon className="h-6 w-6" />
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;
