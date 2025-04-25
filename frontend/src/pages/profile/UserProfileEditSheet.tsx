import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Upload, Radio, Form } from 'antd';
import { supabase } from '../../supabase/client';
import { CloseOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';

interface UserProfileEditSheetProps {
    visible: boolean;
    onClose: () => void;
    initialData?: {
        avatar_url?: string;
        display_name?: string;
        intro?: string;
        gender?: 'male' | 'female';
        research_area?: string;
    };
}

const SHEET_WIDTH = 840;
const SHEET_HEIGHT = 908;

export const UserProfileEditSheet: React.FC<UserProfileEditSheetProps> = ({
    visible,
    onClose,
    initialData
}) => {
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [avatarFile, setAvatarFile] = useState<RcFile | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string>(initialData?.avatar_url || '');

    useEffect(() => {
        if (visible && initialData) {
            form.setFieldsValue(initialData);
        }
    }, [visible, initialData, form]);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const values = await form.validateFields();

            // 获取当前用户会话
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                message.error('用户未登录');
                return;
            }

            let avatarUrl = initialData?.avatar_url;

            // 如果有新的头像文件，先上传头像
            if (avatarFile) {
                const fileName = `${session.user.id}_${Date.now()}_${avatarFile.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('posts-images')
                    .upload(fileName, avatarFile);

                if (uploadError) {
                    message.error('头像上传失败');
                    return;
                }

                if (uploadData) {
                    // 构建完整的公共访问URL
                    const { data } = supabase.storage
                        .from('posts-images')
                        .getPublicUrl(uploadData.path);

                    avatarUrl = data.publicUrl;
                    // 立即更新预览图
                    setAvatarPreview(avatarUrl);
                }
            }

            // 准备要更新的用户数据
            const profileData = {
                avatar_url: avatarUrl,
                display_name: values.display_name,
                intro: values.intro,
                gender: values.gender,
                research_area: values.research_area,
            };

            // 检查用户是否已有个人信息
            const { data: existingProfile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', session.user.id)
                .single();

            let result;
            if (existingProfile) {
                // 更新现有个人信息
                result = await supabase
                    .from('profiles')
                    .update(profileData)
                    .eq('id', session.user.id);
            } else {
                // 创建新的个人信息
                result = await supabase
                    .from('profiles')
                    .insert({ id: session.user.id, ...profileData });
            }

            if (result.error) {
                throw result.error;
            }

            message.success('个人信息更新成功');
            onClose();
        } catch (error) {
            console.error('更新个人信息失败:', error);
            message.error('更新个人信息失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 处理头像上传
    const handleAvatarChange: UploadProps['onChange'] = async (info) => {
        console.log("handleAvatarChange", info);

        try {
            if (!info.file || !(info.file instanceof File)) {
                return;
            }

            setIsSubmitting(true);
            const file = info.file;

            // 创建本地预览
            const reader = new FileReader();
            reader.onload = (e) => {
                setAvatarPreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);

            // 获取当前用户会话
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.user) {
                message.error('用户未登录');
                return;
            }

            // 立即上传头像
            const fileName = `${session.user.id}_${Date.now()}_${file.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('posts-images')
                .upload(fileName, file);

            if (uploadError) {
                message.error('头像上传失败');
                return;
            }

            if (uploadData) {
                console.log('上传成功:', uploadData);
                // 构建完整的公共访问URL
                const { data } = supabase.storage
                    .from('posts-images')
                    .getPublicUrl(uploadData.path);

                const publicUrl = data.publicUrl;
                console.log('公共访问URL:', publicUrl);

                // 更新预览图为上传后的URL
                setAvatarPreview(publicUrl);
                setAvatarFile(file as RcFile);
                message.success('头像上传成功');
            }
        } catch (error) {
            console.error('头像上传失败:', error);
            message.error('头像上传失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 阻止文件自动上传
    const beforeUpload = (file: RcFile) => {
        // 这里可以添加文件类型和大小的检查
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('只能上传图片文件！');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('图片必须小于 2MB！');
            return false;
        }
        return false; // 返回 false 阻止自动上传
    };

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            styles={{
                content: {
                    padding: 0,
                    width: SHEET_WIDTH,
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                },
            }}
            closeIcon={<CloseOutlined style={{ color: 'white' }} />}
        >
            <div style={styles.sheetContainer}>
                <div style={styles.backgroundImage}>
                    <div style={styles.content}>
                        <Form
                            form={form}
                            layout="vertical"
                            style={{ width: '65%', marginTop: '52px' }}
                        >
                            {/* 头像上传 */}
                            <div style={styles.avatarSection}>
                                <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    onChange={handleAvatarChange}
                                    beforeUpload={beforeUpload}
                                >
                                    <div style={styles.avatarUpload}>
                                        {avatarPreview ? (
                                            <img src={avatarPreview} alt="头像" style={styles.avatarPreview} />
                                        ) : (
                                            <div style={styles.avatarPlaceholder}>
                                                <UploadOutlined style={{ fontSize: '32px', color: '#6A4C93' }} />
                                                <span style={{ marginTop: '8px', color: '#6A4C93' }}>上传头像</span>
                                            </div>
                                        )}
                                    </div>
                                </Upload>
                            </div>

                            {/* 昵称输入 */}
                            <Form.Item
                                label="昵称"
                                name="display_name"
                                rules={[{ required: true, message: '请输入昵称' }]}
                            >
                                <Input style={styles.input} />
                            </Form.Item>

                            {/* 个人简介输入 */}
                            <Form.Item
                                label="个人简介"
                                name="intro"
                            >
                                <Input.TextArea style={styles.input} rows={4} />
                            </Form.Item>

                            {/* 性别选择 */}
                            <Form.Item
                                label="性别"
                                name="gender"
                            >
                                <Radio.Group>
                                    <Radio value="male">男</Radio>
                                    <Radio value="female">女</Radio>
                                </Radio.Group>
                            </Form.Item>

                            {/* 研究领域输入 */}
                            <Form.Item
                                label="研究领域"
                                name="research_area"
                            >
                                <Input style={styles.input} />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    style={styles.submitButton}
                                    onClick={handleSubmit}
                                    loading={isSubmitting}
                                >
                                    保存
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    sheetContainer: {
        width: SHEET_WIDTH,
        height: SHEET_HEIGHT,
        overflow: 'hidden',
        position: 'relative',
    },
    backgroundImage: {
        backgroundImage: 'url(/bg_login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'absolute',
        zIndex: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        padding: '40px 0',
        color: '#fff',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#6A4C93',
        marginBottom: '24px',
        textAlign: 'center',
    },
    input: {
        borderRadius: '8px',
        fontSize: '16px',
    },
    avatarSection: {
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '32px',
    },
    avatarUpload: {
        width: '160px',
        height: '160px',
        borderRadius: '50%',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
        border: '2px dashed #e8e8e8',
        overflow: 'hidden',
    },
    avatarPreview: {
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: '50%',
    },
    avatarPlaceholder: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
    },
    submitButton: {
        width: '100%',
        height: '48px',
        borderRadius: '8px',
        background: 'linear-gradient(to bottom, rgba(106, 76, 147, 0.80) 0%, rgba(32, 23, 45, 0.80) 116.11%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        marginTop: '24px',
    },
}; 