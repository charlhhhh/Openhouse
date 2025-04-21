import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import LoginSheet from './LoginSheet';

import './login.css'; // 导入CSS文件


const SIDEBAR_WIDTH = 200;

// 占位页面组件
const PlaceholderScreen = ({ title }: { title: string }) => (
    <div className="placeholder-container">
        <p>{title}</p>
    </div>
);

// 顶部导航栏组件
const TopBar = ({ isLoggedIn, onLoginPress }: { isLoggedIn: boolean; onLoginPress: () => void }) => {
    return (
        <div className="top-bar">
            <div className="search-container">
                <Ionicons name="search" size={20} color="#666" />
                <input
                    className="search-input"
                    placeholder="搜索..."
                    style={{ '--placeholder-color': '#666' } as React.CSSProperties}
                />
            </div>
            <div className="icons-container">
                <button className="icon-button">
                    <Ionicons name="chatbubble-outline" size={24} color="#333" />
                </button>
                <button className="icon-button">
                    <Ionicons name="notifications-outline" size={24} color="#333" />
                </button>
                <button className="icon-button">
                    <Ionicons name="add-circle-outline" size={24} color="#333" />
                </button>
                <button
                    className="icon-button"
                    onClick={onLoginPress}
                >
                    <Ionicons
                        name={isLoggedIn ? "person-circle" : "log-in"}
                        size={24}
                        color="#333"
                    />
                </button>
            </div>
        </div>
    );
};

// 侧边栏组件
const Sidebar = () => {


    const tabs = [
        { name: 'Home', icon: 'home', path: '/(tabs)/index' },
        { name: 'Following', icon: 'people', path: '/(tabs)/following' },
        { name: 'Saved Topic', icon: 'bookmark', path: '/(tabs)/saved-topic' },
        { name: 'Sage AI', icon: 'bulb', path: '/(tabs)/sage-ai' },
        { name: 'Find Partner', icon: 'search', path: '/(tabs)/find-partner' },
        { name: 'Account', icon: 'person', path: '/(tabs)/account' },
    ];

    return (
        <div className="sidebar">
            {tabs.map((tab) => {
                const isActive = TextTrackCueList;
                return (
                    <button
                        key={tab.path}
                        className={`sidebar-item ${isActive ? 'active' : ''}`}
                    // onClick={() => router.push(tab.path)}
                    >
                        <Ionicons
                            name={tab.icon as any}
                            size={24}
                            color={isActive ? '#007AFF' : '#666'}
                        />
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