import React, { useState, useEffect } from 'react';
import { Modal, Input, Button, message, Upload, Radio, Form } from 'antd';
import { CloseOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadProps } from 'antd';
import type { RcFile } from 'antd/es/upload/interface';
import { authService } from '../../services/auth';

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
            form.setFieldsValue({
                display_name: initialData.display_name,
                intro: initialData.intro,
                gender: initialData.gender,
                research_area: initialData.research_area
            });
            setAvatarPreview(initialData.avatar_url || '');
        }
    }, [visible, initialData, form]);

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            const values = await form.validateFields();

            // 构建请求参数
            const updateData = {
                username: values.display_name,
                intro_long: values.intro,
                gender: values.gender,
                research_area: values.research_area,
                avatar_url: avatarPreview || initialData?.avatar_url
            };

            // 使用 authService 发送更新请求
            await authService.updateUserProfile(updateData);

        } catch (error) {
            message.error('Fail to update profile');
        } finally {
            setIsSubmitting(false);
            onClose();
        }
    };

    // 处理头像上传
    const handleAvatarChange: UploadProps['onChange'] = async (info) => {
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

            // 使用authService.uploadImage上传图片到服务器
            const url = await authService.uploadImage(file);
            setAvatarPreview(url); // 直接用服务器返回的图片url作为预览
            setAvatarFile(file as RcFile);
            message.success('头像上传成功');
        } catch (error: any) {
            message.error(error?.message || '头像上传失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 阻止文件自动上传
    const beforeUpload = (file: RcFile) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Only image files can be uploaded!');
            return false;
        }
        const isLt2M = file.size / 1024 / 1024 < 2;
        if (!isLt2M) {
            message.error('The image must be less than 2MB!');
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
                                            <img src={avatarPreview} alt="avator" style={styles.avatarPreview} />
                                        ) : (
                                            <div style={styles.avatarPlaceholder}>
                                                <UploadOutlined style={{ fontSize: '32px', color: '#6A4C93' }} />
                                                <span style={{ marginTop: '8px', color: '#6A4C93' }}>Upload Avatar</span>
                                            </div>
                                        )}
                                    </div>
                                </Upload>
                            </div>

                            {/* 昵称输入 */}
                            <Form.Item
                                label="Display Name"
                                name="display_name"
                                rules={[{ required: true, message: 'Please enter your display name' }]}
                            >
                                <Input style={styles.input} />
                            </Form.Item>

                            {/* 个人简介输入 */}
                            <Form.Item
                                label="Intro"
                                name="intro"
                            >
                                <Input.TextArea style={styles.input} rows={4} />
                            </Form.Item>

                            {/* 性别选择 */}
                            <Form.Item
                                label="Gender"
                                name="gender"
                            >
                                <Radio.Group>
                                    <Radio value="male">Male</Radio>
                                    <Radio value="female">Female</Radio>
                                </Radio.Group>
                            </Form.Item>

                            {/* 研究领域输入 */}
                            <Form.Item
                                label="Research Area"
                                name="research_area"
                            >
                                <Input style={styles.input} />
                            </Form.Item>
                        </Form>
                        <Button
                            style={styles.submitButton}
                            onClick={handleSubmit}
                            loading={isSubmitting}
                        >
                            Save
                        </Button>
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
        justifyContent: 'center',
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
        width: '25%',
        height: '48px',
        borderRadius: '8px',
        background: 'linear-gradient(to bottom, rgba(106, 76, 147, 0.80) 0%, rgba(32, 23, 45, 0.80) 116.11%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        marginTop: '24px',
    },
}; 