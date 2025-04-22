// Login.tsx
import React from 'react';
import './Login.css'; // 引入样式文件

const Login: React.FC = () => {
    // Google登录处理 (Web版)
    const handleGoogleLogin = () => {
        try {
            const clientId = 'YOUR_GOOGLE_WEB_CLIENT_ID';
            const redirectUri = encodeURIComponent(window.location.origin);
            const scope = encodeURIComponent('profile email');
            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;

            // 重定向到Google登录页面
            window.location.href = authUrl;
        } catch (error) {
            console.error('Google登录失败:', error);
        }
    };

    // Microsoft登录处理 (Web版)
    const handleMicrosoftLogin = async () => {
    };

    // GitHub登录处理 (Web版)
    const handleGitHubLogin = () => {
        try {
            const clientId = 'YOUR_GITHUB_CLIENT_ID';
            const redirectUri = encodeURIComponent(window.location.origin);
            const scope = encodeURIComponent('user');
            const authUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

            // 重定向到GitHub登录页面
            window.location.href = authUrl;
        } catch (error) {
            console.error('GitHub登录失败:', error);
        }
    };

    return (
        <div className="login-container">
            <button className="login-button google" onClick={handleGoogleLogin}>
                使用Google登录
            </button>

            <button className="login-button microsoft" onClick={handleMicrosoftLogin}>
                使用Microsoft登录
            </button>

            <button className="login-button github" onClick={handleGitHubLogin}>
                使用GitHub登录
            </button>
        </div>
    );
};

export default Login;