import { useRef } from 'react';
import { CustomModalRef } from '../components/PrimaryModal';

interface ModalButton {
  text: string;
  onPress: () => void;
  style?: 'primary' | 'secondary';
}

interface ShowModalOptions {
  type?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  buttons?: ModalButton[];
  showCloseButton?: boolean;
}

export const useModal = () => {
  const modalRef = useRef<CustomModalRef>(null);

  const showModal = (options: ShowModalOptions) => {
    modalRef.current?.show(options);
  };

  const hideModal = () => {
    modalRef.current?.hide();
  };

  // Helper methods for common use cases
  const showError = (message: string, title?: string, onPress?: () => void) => {
    showModal({
      type: 'error',
      title: title || 'Error',
      message,
      buttons: [
        {
          text: 'OK',
          onPress: onPress || (() => hideModal()),
          style: 'primary',
        },
      ],
    });
  };

  const showSuccess = (message: string, title?: string, onPress?: () => void) => {
    showModal({
      type: 'success',
      title: title || 'Success',
      message,
      buttons: [
        {
          text: 'OK',
          onPress: onPress || (() => hideModal()),
          style: 'primary',
        },
      ],
    });
  };

  const showWarning = (message: string, title?: string, onPress?: () => void) => {
    showModal({
      type: 'warning',
      title: title || 'Warning',
      message,
      buttons: [
        {
          text: 'OK',
          onPress: onPress || (() => hideModal()),
          style: 'primary',
        },
      ],
    });
  };

  const showConfirm = (
    message: string,
    onConfirm: () => void,
    onCancel?: () => void,
    title?: string
  ) => {
    showModal({
      type: 'info',
      title: title || 'Confirm',
      message,
      buttons: [
        {
          text: 'Cancel',
          onPress: onCancel || (() => hideModal()),
          style: 'secondary',
        },
        {
          text: 'Confirm',
          onPress: () => {
            onConfirm();
            hideModal();
          },
          style: 'primary',
        },
      ],
    });
  };

  return {
    modalRef,
    showModal,
    hideModal,
    showError,
    showSuccess,
    showWarning,
    showConfirm,
  };
};