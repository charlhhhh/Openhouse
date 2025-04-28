/**
 * 格式化帖子日期
 * 1. 当天帖子显示具体时间（Today HH:mm）
 * 2. 今年帖子显示月日（MM-DD）
 * 3. 往年帖子显示年月日（YYYY-MM-DD）
 */
export const formatPostDate = (dateString: string): string => {
    const postDate = new Date(dateString);
    const now = new Date();

    // 获取当地时间的年月日
    const postYear = postDate.getFullYear();
    const postMonth = postDate.getMonth() + 1;
    const postDay = postDate.getDate();
    const currentYear = now.getFullYear();

    // 判断是否是同一天
    const isToday = (
        postYear === now.getFullYear() &&
        postMonth === (now.getMonth() + 1) &&
        postDay === now.getDate()
    );

    if (isToday) {
        // 当天帖子，显示Today和具体时间
        const time = postDate.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        return `Today ${time}`;
    } else if (postYear === currentYear) {
        // 今年的帖子，显示月-日
        return `${postMonth.toString().padStart(2, '0')}-${postDay.toString().padStart(2, '0')}`;
    } else {
        // 往年的帖子，显示完整日期
        return `${postYear}-${postMonth.toString().padStart(2, '0')}-${postDay.toString().padStart(2, '0')}`;
    }
}; 