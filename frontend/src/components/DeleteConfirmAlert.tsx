import React from 'react';
import { CustomAlert } from './CustomAlert';

interface DeleteConfirmAlertProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  subtitle?: string;
}

export const DeleteConfirmAlert: React.FC<DeleteConfirmAlertProps> = ({
  visible,
  onCancel,
  onConfirm,
  title = "Confirm Delete",
  subtitle = "Are you sure you want to delete this post?"
}) => {
  return (
    <CustomAlert
      visible={visible}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={title}
      subtitle={subtitle}
      iconSrc="/post_delete_alert.svg"
      cancelText="Cancel"
      confirmText="Confirm"
    />
  );
}; 