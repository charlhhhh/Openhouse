// supabase/functions/sync-github-profile/index.ts

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS Headers - 允许你的前端调用
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 生产环境建议换成你的前端域名
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS', // 接受 POST 和 浏览器预检 OPTIONS 请求
}

// 封装更新 Profile 的逻辑
async function updateUserProfile(supabase: SupabaseClient, userId: string, updateData: object) {
  console.log(`Updating profile for user ${userId} with data:`, updateData);
  // 使用 Admin Client 或确保 RLS 允许用户更新自己的这些字段
  // 为简单起见，这里继续使用传入请求头认证的 Client，依赖 RLS
  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);
  if (error) {
    console.error(`DB Update Error for user ${userId}:`, error);
  }
  return error;
}

serve(async (req) => {
  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 使用从请求头传入的 Authorization (JWT) 创建 Supabase 客户端
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '', // 使用 Anon Key + RLS
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // 获取调用此函数的用户信息
    const { data: { user }, error: getUserError } = await supabaseClient.auth.getUser();

    if (getUserError || !user) {
      console.error('sync-github-profile: Auth Error:', getUserError?.message);
      return new Response(JSON.stringify({ error: 'Unauthorized: Could not get user' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // **关键步骤：从用户元数据中获取 GitHub 用户名**
    // **你需要实际测试 GitHub 登录后，打印 user 对象 (e.g., console.log(JSON.stringify(user, null, 2)))，**
    // **确认 GitHub 用户名存储在哪个字段下！**
    // 常见可能性：user.user_metadata?.user_name, user.user_metadata?.name
    // 或者是 user.raw_user_meta_data.login (如果可用)
    // 这里我们优先尝试 user_metadata.user_name (请务必验证!)
    const githubUsername = user.user_metadata?.user_name ?? null;
    let message = 'GitHub linked successfully.';

    console.log(`Attempting to sync GitHub for user ${user.id}. Metadata username found: ${githubUsername}`);

    // 准备更新的数据
    const profileUpdateData: {
      github_username?: string | null;
      github_verified: boolean;
      updated_at: string;
      onboarding_complete?: boolean; // 根据你的流程，链接成功也可视为Onboarding完成
    } = {
      github_verified: true,
      updated_at: new Date().toISOString(),
      onboarding_complete: true, // 假设链接成功就算完成
      github_username: githubUsername, // 如果没找到就是 null
    };

    if (!githubUsername) {
      message = 'GitHub linked, but username could not be retrieved from metadata.';
      console.warn(`User ${user.id} linking GitHub, username not found in user metadata.`);
    }

    // 更新 profiles 表
    const updateError = await updateUserProfile(supabaseClient, user.id, profileUpdateData);

    if (updateError) {
      // 可以考虑返回更具体的错误信息给前端（生产环境注意安全）
      return new Response(JSON.stringify({ error: 'Failed to update profile with GitHub info', details: updateError.message }), {
        status: 500, // 或根据错误类型判断，如 RLS 错误可能是 403
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 返回成功响应给前端
    console.log(`Successfully updated profile for user ${user.id} after GitHub link.`);
    // 在成功响应中也返回获取到的用户名，方便前端使用
    return new Response(JSON.stringify({ success: true, message: message, github_username: githubUsername }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    // 捕获意外错误
    console.error('sync-github-profile: Unexpected Error:', e);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: e.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})

console.log(`Function "sync-github-profile" waiting for requests...`);