import { message } from 'antd';
import { supabase } from '../supabase/client';

/**
 * 生成安全的文件名
 * @param fileName 原始文件名
 * @returns 处理后的安全文件名
 */
const sanitizeFileName = (fileName: string): string => {
    const ext = fileName.split('.').pop() || '';
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `${Date.now()}_${randomStr}.${ext}`;
};

interface UploadImageOptions {
    /** Supabase storage bucket name */
    bucket?: string;
    /** 是否显示上传成功消息 */
    showSuccessMessage?: boolean;
    /** 自定义错误处理函数 */
    onError?: (error: any) => void;
}

/**
 * 上传图片到 Supabase Storage
 * @param file 要上传的文件
 * @param options 上传选项
 * @returns 上传成功返回图片URL，失败返回null
 */
export const uploadImage = async (
    file: File,
    options: UploadImageOptions = {}
): Promise<string | null> => {
    const {
        bucket = 'posts-images',
        showSuccessMessage = false,
        onError
    } = options;

    try {
        // 验证文件类型
        if (!file.type.startsWith('image/')) {
            message.error('只能上传图片文件');
            return null;
        }

        // 验证文件大小（2MB）
        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            message.error('图片大小不能超过50MB');
            return null;
        }

        // 生成安全的文件名
        const fileName = sanitizeFileName(file.name);

        const { data: uploadData, error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file);

        if (uploadError) {
            const errorMessage = `图片上传失败: ${uploadError.message}`;
            if (onError) {
                onError(uploadError);
            } else {
                message.error(errorMessage);
            }
            return null;
        }

        if (uploadData) {
            const { data } = supabase.storage
                .from(bucket)
                .getPublicUrl(uploadData.path);

            if (showSuccessMessage) {
                message.success('图片上传成功');
            }

            return data.publicUrl;
        }

        return null;
    } catch (error) {
        console.error('图片上传错误:', error);
        if (onError) {
            onError(error);
        } else {
            message.error('图片上传失败，请稍后重试');
        }
        return null;
    }
}; 