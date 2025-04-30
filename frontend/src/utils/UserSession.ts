import { UserProfile, UserSession } from '../types/user';
import Cookies from 'js-cookie';

class UserSessionManager {
    private static instance: UserSessionManager;
    private session: UserSession | null = null;
    private listeners: Set<() => void> = new Set();
    private userId: string = '';
    private profile: UserProfile | null = null;

    private constructor() {
        // 从cookie中恢复session
        const token = Cookies.get('token');

        if (token) {
            this.session = { token };
        }
    }

    public static getInstance(): UserSessionManager {
        if (!UserSessionManager.instance) {
            UserSessionManager.instance = new UserSessionManager();
        }
        return UserSessionManager.instance;
    }

    public getSession(): UserSession | null {
        return this.session;
    }

    public setSession(token: string) {
        // 保存到cookie
        console.log('setSession', token);
        this.session = { token };
        Cookies.set('userId', token);
        this.notifyListeners();
    }

    public clearSession() {
        this.session = null;
        Cookies.remove('token');
        this.notifyListeners();
    }

    public addListener(listener: () => void) {
        this.listeners.add(listener);
    }

    public removeListener(listener: () => void) {
        this.listeners.delete(listener);
    }

    private notifyListeners() {
        this.listeners.forEach(listener => listener());
    }

    getUserId(): string {
        const userProfile = localStorage.getItem('user_profile');
        if (userProfile) {
            try {
                const profile = JSON.parse(userProfile);
                return profile.uuid || '';
            } catch (error) {
                console.error('解析用户信息失败:', error);
                return '';
            }
        }
        return '';
    }

    getUserAvatar(): string {
        const userProfile = localStorage.getItem('user_profile');
        if (userProfile) {
            try {
                const profile = JSON.parse(userProfile);
                return profile.avatar_url || '';
            } catch (error) {
                console.error('解析用户信息失败:', error);
                return '';
            }
        }
        return '';
    }
}

export const userSession = UserSessionManager.getInstance(); 