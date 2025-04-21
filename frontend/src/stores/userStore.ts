import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 定义用户信息类型
interface UserInfo {
  id?: string;
  username?: string;
  email?: string;
  avatar?: string;
  // 可根据需要添加更多用户信息字段
}

// 定义用户状态类型
interface UserState {
  isLoggedIn: boolean;
  token: string | null;
  userInfo: UserInfo;
  // 登录方法
  login: (token: string, userInfo: UserInfo) => void;
  // 更新用户信息方法
  updateUserInfo: (userInfo: Partial<UserInfo>) => void;
  // 登出方法
  logout: () => void;
}

// 创建用户状态管理 store
const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      token: null,
      userInfo: {},
      
      // 登录方法，设置登录状态、token和用户信息
      login: (token, userInfo) => set({
        isLoggedIn: true,
        token,
        userInfo
      }),
      
      // 更新用户信息方法
      updateUserInfo: (newUserInfo) => set((state) => ({
        userInfo: { ...state.userInfo, ...newUserInfo }
      })),
      
      // 登出方法，清除登录状态和用户信息
      logout: () => set({
        isLoggedIn: false,
        token: null,
        userInfo: {}
      })
    }),
    {
      name: 'user-storage', // localStorage 中的存储键名
      storage: createJSONStorage(() => localStorage), // 使用 localStorage 进行持久化存储
    }
  )
);

export default useUserStore; 