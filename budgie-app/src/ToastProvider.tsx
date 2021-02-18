import React, {
  FC, useCallback, useEffect, useState,
} from 'react';
import {
  Text, Card,
} from '@ui-kitten/components';
import tailwind from 'tailwind-rn';
import { EvaStatus } from '@ui-kitten/components/devsupport';
import { View } from 'react-native';

interface ShowToastOptions {
    message: string | React.ReactNode
    status: EvaStatus
    duration?: number
}

interface ToastCtx {
    showToast:(options: ShowToastOptions) => void
}

export const ToastContext = React.createContext<ToastCtx>({
  showToast: () => null,
});

export const useToast = () => React.useContext(ToastContext);

interface ToastProps {
    id: string
    message: string | React.ReactNode
    status: EvaStatus
    duration: number
    onClose: (id: string) => void
}

export const Toast: FC<ToastProps> = ({
  id, message, duration, onClose,
}) => {
  useEffect(() => {
    setTimeout(() => {
      onClose(id);
    }, duration);
  }, []);

  return (
    <View style={tailwind('absolute z-10 w-full flex justify-center')}>
      <Card style={tailwind('self-center mt-10 mb-2 ml-5 mr-5')} status="danger">
        {typeof message === 'string' ? <Text style={tailwind('font-bold')}>{message}</Text> : (message) }
      </Card>
    </View>
  );
};

export const ToastProvider: FC = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const onClose = useCallback((id: string) => {
    setToasts(prevToasts => prevToasts.filter((toast) => toast.id !== id));
  }, [setToasts]);

  const showToast = useCallback((options: ShowToastOptions) => {
    setToasts(prevToasts => [...prevToasts, {
      id: `${Math.random()}`,
      status: options.status,
      message: options.message,
      duration: options.duration || 5000,
      onClose,
    }]);
  }, [setToasts]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <>
        {toasts.map(toast => (
          <Toast
            {...toast}
            key={toast.id}
          />
        ))}
      </>
    </ToastContext.Provider>
  );
};
