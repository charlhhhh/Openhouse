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
  title = "确认删除",
  subtitle = "你确定要删除这个帖子吗？"
}) => {
  return (
    <CustomAlert
      visible={visible}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={title}
      subtitle={subtitle}
      iconSrc="/post_delete_alert.svg"
      cancelText="取消"
      confirmText="确认"
    />
  );
}; 