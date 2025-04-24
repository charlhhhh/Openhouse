// src/supabase/client.tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 添加类型检查
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase 环境变量未配置！');
}

// 创建并导出 supabase 客户端
export const supabase = createClient(supabaseUrl, supabaseKey);

// 可选：导出其他需要的类型
export type AuthSession = Awaited<ReturnType<typeof supabase.auth.getSession>>;