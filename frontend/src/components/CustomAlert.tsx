import React from 'react';
import { Modal, Button } from 'antd';
import styled from 'styled-components';

const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 24px;
    width: 375px;
    background: white;
  }
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
`;

const AlertIcon = styled.img`
  width: 50px;
  height: 50px;
  margin-top: 5px;
`;

const Title = styled.div`
  color: #000;
  text-align: center;
  font-family: Inter;
  font-size: 20px;
  font-style: normal;
  font-weight: 500;
  line-height: normal;
`;

const Subtitle = styled.div`
  color: #000;
  text-align: center;
  font-family: Inter;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 10px;
`;

const CancelButton = styled(Button)`
  &&.ant-btn {
    border-radius: 10px;
    background: rgba(154, 154, 154, 0.80);
    color: #fff;
    border: none;
    
    &:hover {
      background: rgba(154, 154, 154, 0.90) !important;
      color: #fff !important;
    }

    &:focus, &:active {
      background: rgba(154, 154, 154, 0.80);
      color: #fff;
      border: none;
      outline: none;
      box-shadow: none;
    }
  }
`;

const ConfirmButton = styled(Button)`
  &&.ant-btn {
    border-radius: 10px;
    background: linear-gradient(96deg, rgba(106, 76, 147, 0.80) 45.49%, rgba(32, 23, 45, 0.80) 99.83%);
    color: #fff;
    border: none;
    
    &:hover {
      background: linear-gradient(96deg, rgba(106, 76, 147, 0.90) 45.49%, rgba(32, 23, 45, 0.90) 99.83%) !important;
      color: #fff !important;
    }

    &:focus, &:active {
      background: linear-gradient(96deg, rgba(106, 76, 147, 0.80) 45.49%, rgba(32, 23, 45, 0.80) 99.83%);
      color: #fff;
      border: none;
      outline: none;
      box-shadow: none;
    }
  }
`;

interface CustomAlertProps {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    title: string;
    subtitle: string;
    iconSrc: string;
    cancelText?: string;
    confirmText?: string;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
    visible,
    onCancel,
    onConfirm,
    title,
    subtitle,
    iconSrc,
    cancelText = "取消",
    confirmText = "确认"
}) => {
    return (
        <StyledModal
            open={visible}
            footer={null}
            closable={false}
            maskClosable={true}
            onCancel={onCancel}
            centered
        >
            <ContentContainer>
                <AlertIcon src={iconSrc} alt="alert-icon" />
                <Title>{title}</Title>
                <Subtitle>{subtitle}</Subtitle>
                <ButtonContainer>
                    <CancelButton onClick={onCancel}>{cancelText}</CancelButton>
                    <ConfirmButton onClick={onConfirm}>{confirmText}</ConfirmButton>
                </ButtonContainer>
            </ContentContainer>
        </StyledModal>
    );
}; 