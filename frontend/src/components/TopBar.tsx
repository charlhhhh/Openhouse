import React, { useState, useEffect } from 'react';
import { Input, Button, Dropdown, MenuProps, Avatar } from 'antd';
import { SearchOutlined, BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { userSession } from '../utils/UserSession';
import { authService } from '../services/auth';

const TopBarContainer = styled.div`
  height: 88px;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 0 65px;
  background: linear-gradient(0deg, rgba(255, 252, 246, 0.80) 0%, rgba(255, 252, 246, 0.80) 100%);
  border: 1px solid rgba(201, 201, 217, 0.50);
  filter: drop-shadow(2px 5px 5px rgba(0, 0, 0, 0.25));
  z-index: 100;
`;

const SearchContainer = styled.div`
  width: 60%;
  margin-right: auto;
`;

const StyledInput = styled(Input)`
  border-radius: 10px;
  border: 1px solid #000 !important;
  height: 40px;
  outline: none !important;
  
  .ant-input-prefix {
    margin-right: 8px;
  }

  &:hover, &:focus, &active {
    // outline: none !important;
    // border-color: #000 !important;
    // box-shadow: none !important;
    // border-color: #6A4C93!important;
    border: 1px solid #000 !important;
    background: transparent !important;
    box-shadow: none !important;
    outline: none !important;
  }
`;


const ButtonGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StyledAvatar = styled(Avatar)`
  cursor: pointer;
  &:hover {
    opacity: 0.8;
  }
`;

const AccountButton = styled(Button)`
  width: 40px;
  height: 40px;
  padding: 0;
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    background: none;
  }
`;




const NotificationButton = styled(Button)`
  width: 35px;
  height: 35px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  outline: none !important;
  margin-left: 56px;
  
  &:hover, &:active, &:focus {
    outline: none !important;
    background: transparent !important;
    border: none !important;
    border-color: #6A4C93!important;
    box-shadow: none !important;
  }
`;

const PostButton = styled(Button)`
  padding: 5px 63px 5px 44px;
  display: flex;
  align-items: center;
  border-radius: 10px;
  background: linear-gradient(180deg, #6A4C93 37.02%, #875FBF 83.17%);
  box-shadow: 2px 2px 4px 0px rgba(135, 95, 191, 0.50), 0px 8px 6.8px 0px rgba(0, 0, 0, 0.25) inset;
  border: none;
  color: white;
  font-weight: 500;
  
  &:hover, &:active, &:focus {
    background: linear-gradient(180deg, #6A4C93 37.02%, #875FBF 83.17%) !important;
    border: none !important;
    box-shadow: 2px 2px 4px 0px rgba(135, 95, 191, 0.50), 0px 8px 6.8px 0px rgba(0, 0, 0, 0.25) inset !important;
    color: white !important;
    outline: none !important;
    border-color: #6A4C93!important;
  }
`;

const StyledDropdown = styled(Dropdown)`
  .ant-dropdown-menu {
    border-radius: 10px;
    padding: 8px;
  }

  .ant-dropdown-menu-item {
    padding: 8px 16px;
    color: #000;
    
    &:hover {
      background: rgba(106, 76, 147, 0.1);
    }
  }
`;

interface TopBarProps {
    onShowLogin: () => void;
}

export default function TopBar({ onShowLogin }: TopBarProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userAvatar, setUserAvatar] = useState('');
    const navigate = useNavigate();

    const updateLoginStatus = () => {
        const loggedIn = authService.isLoggedIn();
        setIsLoggedIn(loggedIn);
        if (loggedIn) {
            setUserAvatar(userSession.getUserAvatar());
        } else {
            setUserAvatar('');
        }
    };

    useEffect(() => {
        // 检查登录状态
        updateLoginStatus();

        // 注册登录状态变化监听器
        userSession.addListener(updateLoginStatus);

        // 组件卸载时移除监听器
        return () => {
            userSession.removeListener(updateLoginStatus);
        };
    }, []);

    const handleAccountClick = () => {
        if (!isLoggedIn) {
            onShowLogin();
        } else {
            navigate('/account');
        }
    };

    const handleLogout = async () => {
        authService.clearToken();
        userSession.clearSession();
        localStorage.removeItem('user_profile');
        updateLoginStatus();
        navigate('/');
    };

    const handlePostClick = () => {
        navigate('/createPost');
    };

    const accountMenuItems: MenuProps['items'] = [
        {
            key: 'logout',
            label: 'Logout',
            icon: <LogoutOutlined />,
            onClick: handleLogout
        }
    ];

    return (
        <TopBarContainer>
            <SearchContainer>
                <StyledInput
                    prefix={<SearchOutlined style={{ color: '#6A4C93' }} />}
                    placeholder="Search"
                />
            </SearchContainer>
            <ButtonGroup>
                <NotificationButton icon={<BellOutlined style={{ fontSize: '20px' }} />} />
                <PostButton onClick={handlePostClick}>+Post</PostButton>
                {isLoggedIn ? (
                    <StyledDropdown
                        menu={{ items: accountMenuItems }}
                        trigger={['hover']}
                        placement="bottomRight"
                    >
                        <StyledAvatar
                            src={userAvatar}
                            icon={!userAvatar && <UserOutlined />}
                            onClick={handleAccountClick}
                        />
                    </StyledDropdown>
                ) : (
                    <AccountButton
                        icon={<UserOutlined style={{ fontSize: '20px' }} />}
                        onClick={handleAccountClick}
                    />
                )}
            </ButtonGroup>
        </TopBarContainer>
    );
} 