import { supabase } from '../supabase/client';
import { UserProfile, UserSession } from '../types/user';
import Cookies from 'js-cookie';

class UserSessionManager {
    private static instance: UserSessionManager;
    private session: UserSession | null = null;
    private listeners: Set<() => void> = new Set();

    private constructor() {
        // 从cookie中恢复session
        const userId = Cookies.get('userId');
        const email = Cookies.get('email');
        if (userId && email) {
            this.session = { userId, email };
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

    public setSession(userId: string, email: string, profile?: UserProfile) {
        this.session = { userId, email, profile };
        // 保存到cookie
        Cookies.set('userId', userId);
        Cookies.set('email', email);
        this.notifyListeners();
    }

    public clearSession() {
        this.session = null;
        Cookies.remove('userId');
        Cookies.remove('email');
        this.notifyListeners();
    }

    public updateProfile(profile: UserProfile) {
        console.log('更新用户资料:', profile);
        userSession.updateProfile(profile);

        if (this.session) {
            this.session.profile = profile;
            this.notifyListeners();
        }
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
}

export const userSession = UserSessionManager.getInstance(); 