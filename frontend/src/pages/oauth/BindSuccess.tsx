import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { authService } from '../../services/auth';




// 添加了 processedRef 来跟踪是否已经处理过 token
// 在 effect 中首先检查是否已处理过，如果是则直接返回
// 只在第一次处理 token 时执行相关操作
// 修改了导航逻辑，登录失败时导航到登录页面而不是首页
// 这样的改进可以：
// 防止重复处理 token
// 避免重复显示消息提示
// 避免重复的导航操作
// 提供更好的用户体验（失败时导航到登录页面）

export default function BindSuccess() {
    const navigate = useNavigate();
    const processedRef = useRef(false);

    useEffect(() => {
        // 如果已经处理过，则直接返回
        if (processedRef.current) {
            return;
        }

        // 从URL中解析token
        const result = authService.parseBindSuccessFromUrl();

        if (result) {
            // 标记为已处理
            navigate(`/account?result=${result}`, { replace: true });
        } else if (!processedRef.current) {
            // 只有在第一次失败时才显示错误消息
            navigate('/account', { replace: true });
        }
    }, [navigate]);

    return null;
} 