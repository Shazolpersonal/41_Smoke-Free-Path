import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import Toast from '@/components/Toast';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [variant, setVariant] = useState<ToastVariant>('info');
  const [duration, setDuration] = useState(3000);

  const showToast = useCallback((msg: string, v: ToastVariant = 'info', dur = 3000) => {
    setMessage(msg);
    setVariant(v);
    setDuration(dur);
    setVisible(true);
  }, []);

  const hideToast = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={visible}
        message={message}
        variant={variant}
        duration={duration}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
