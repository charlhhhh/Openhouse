import React from 'react';
import { Button } from 'antd';
import './ActionButton.css';

interface ActionButtonProps {
    icon: React.ReactNode;
    activeIcon: React.ReactNode;
    text: string | number;
    onClick?: () => void;
    isActive?: boolean;
    loading?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    icon,
    activeIcon,
    text,
    onClick,
    isActive = false,
    loading = false
}) => (
    <Button
        className={`action-button ${isActive ? 'active' : ''}`}
        onClick={onClick}
        loading={loading}
        icon={isActive ? activeIcon : icon}
    >
        {text}
    </Button>
); 