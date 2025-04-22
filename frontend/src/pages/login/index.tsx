import React, { useState } from 'react';
import { SearchOutlined, MessageOutlined, BellOutlined, PlusCircleOutlined, UserOutlined, LoginOutlined, HomeOutlined, TeamOutlined, BookOutlined, BulbOutlined } from '@ant-design/icons';
import { Input } from 'antd';
import LoginSheet from './LoginSheet';

import { useNavigate } from 'react-router-dom';

import './login.css'; // 导入CSS文件

// 顶部导航栏组件
const TopBar = ({ isLoggedIn, onLoginPress }: { isLoggedIn: boolean; onLoginPress: () => void }) => {
    return (
        <div className="top-bar">
            <div className="search-container">
                <SearchOutlined style={{ fontSize: '20px', color: '#666' }} />
                <Input
                    className="search-input"
                    placeholder="搜索..."
                    bordered={false}
                />
            </div>
            <div className="icons-container">
                <button className="icon-button">
                    <MessageOutlined style={{ fontSize: '24px', color: '#333' }} />
                </button>
                <button className="icon-button">
                    <BellOutlined style={{ fontSize: '24px', color: '#333' }} />
                </button>
                <button className="icon-button">
                    <PlusCircleOutlined style={{ fontSize: '24px', color: '#333' }} />
                </button>
                <button
                    className="icon-button"
                    onClick={onLoginPress}
                >
                    {isLoggedIn ?
                        <UserOutlined style={{ fontSize: '24px', color: '#333' }} /> :
                        <LoginOutlined style={{ fontSize: '24px', color: '#333' }} />
                    }
                </button>
            </div>
        </div>
    );
};

// 侧边栏组件
const Sidebar = () => {
    const navigate = useNavigate();
    const tabs = [
        { name: 'Home', icon: <HomeOutlined />, path: '/(tabs)/index' },
        { name: 'Following', icon: <TeamOutlined />, path: '/(tabs)/following' },
        { name: 'Saved Topic', icon: <BookOutlined />, path: '/(tabs)/saved-topic' },
        { name: 'Sage AI', icon: <BulbOutlined />, path: '/(tabs)/sage-ai' },
        { name: 'Find Partner', icon: <SearchOutlined />, path: '/(tabs)/find-partner' },
        { name: 'Account', icon: <UserOutlined />, path: '/(tabs)/account' },
    ];

    return (
        <div className="sidebar">
            {tabs.map((tab) => {
                const isActive = false; // 临时设为false，后续可根据路由状态判断
                return (
                    <button
                        key={tab.path}
                        className={`sidebar-item ${isActive ? 'active' : ''}`}
                        // <button onClick={() => navigate('/login')}>Login</button>
                        onClick={() => navigate(tab.path)}
                    >
                        <span style={{
                            fontSize: '24px',
                            color: isActive ? '#007AFF' : '#666'
                        }}>
                            {tab.icon}
                        </span>
                        <span className={`sidebar-text ${isActive ? 'active' : ''}`}>
                            {tab.name}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

// 主页面组件
const MainScreen = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [showLoginSheet, setShowLoginSheet] = useState(false);


    const handleLoginSuccess = () => {
        setIsLoggedIn(true);
        setShowLoginSheet(false);
    };

    return (
        <div className="container">
            <TopBar
                isLoggedIn={isLoggedIn}
                onLoginPress={() => setShowLoginSheet(true)}
            />
            <div className="content-container">
                <Sidebar />
                <div className="main-content">
                    {/* 这里的内容会根据路由自动变化 */}
                </div>
            </div>
            <LoginSheet
                visible={showLoginSheet}
                onClose={() => setShowLoginSheet(false)}
                onLoginSuccess={handleLoginSuccess}
            />
        </div>
    );
};

export default MainScreen;