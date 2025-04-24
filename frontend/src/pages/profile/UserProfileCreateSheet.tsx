import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { supabase } from '../../supabase/client';
import { userSession } from '../../utils/UserSession';
import { UserProfile } from '../../types/user';
import {
    CloseOutlined,
    MailOutlined,
} from "@ant-design/icons";


interface UserProfileCreateSheetProps {
    visible: boolean;
    onClose: () => void;
}

const SHEET_WIDTH = 840;
const SHEET_HEIGHT = 908;

export const UserProfileCreateSheet: React.FC<UserProfileCreateSheetProps> = ({
    visible,
    onClose
}) => {
    const [nickname, setNickname] = useState('');
    const [githubUsername, setGithubUsername] = useState('');
    const [researchAreas, setResearchAreas] = useState('');
    // const [schoolEmail, setSchoolEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createProfileModalVisible, setCreateProfileModalVisible] = useState(true);
    const handleCreateProfileCancel = () => {
        setCreateProfileModalVisible(false);
    }

    const handleSubmit = async () => {
        console.log('提交:', nickname, githubUsername, researchAreas);
        if (!nickname.trim()) {
            message.warning('请输入昵称');
            return;
        }

        setIsSubmitting(true);
        try {
            const session = userSession.getSession();
            console.log("session:", session)
            if (!session) return;

            const profile: UserProfile = {
                id: session.userId,
                email: session.email,
                display_name: nickname,
                github_username: githubUsername,
                research_area: researchAreas,
                tags: [],
                // school_email: schoolEmail
            };
            console.log("profile:", profile)

            const { error } = await supabase.from('profiles').insert({ ...profile })


            if (error) {
                console.error('插入用户资料失败:', error);
                return;
            }


            if (error) throw error;

            userSession.updateProfile(profile);
            message.success('个人信息创建成功');
            onClose();
        } catch (error) {
            console.error('创建个人信息失败:', error);
            message.error('创建个人信息失败');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={createProfileModalVisible}
            onCancel={handleCreateProfileCancel}
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
                        <div style={styles.inputContainer}>
                            <Input
                                style={styles.input}
                                placeholder="Enter ID"
                                onChange={(e) => { setNickname(e.target.value) }}
                            />
                        </div>
                        <div style={styles.inputContainer}>
                            <Input
                                style={styles.input}
                                placeholder="GitHub"
                                onChange={(e) => { setGithubUsername(e.target.value) }}
                            />
                        </div>
                        <div style={styles.inputContainer}>
                            <Input
                                style={styles.input}
                                placeholder="Reasearch Areas"
                                onChange={(e) => { setResearchAreas(e.target.value) }}
                            />
                        </div>

                        <Button
                            style={styles.submitButton}
                            onClick={handleSubmit}
                            loading={isSubmitting}
                        >
                            确认
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
        // backgroundColor: 'transparent',
    },
    backgroundImage: {
        // width: '100%',
        // height: '100%',
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
    header: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        padding: '20px',
    },
    closeButton: {
        padding: '8px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    content: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        padding: '380px 0px 0px 0px',
        paddingTop: `calc(${SHEET_HEIGHT} * 0.35)`,
        color: '#fff',
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#6A4C93',
        marginBottom: '8px',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: '16px',
        color: '#6A4C93',
        marginBottom: '8px',
        textAlign: 'center',
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        // marginBottom: '18px',
        padding: '0 16px',
        width: '65%',
        height: '65px',
        margin: '10px auto',
    },
    input: {
        flex: 1,
        height: '60px',
        fontSize: '24px',
        borderRadius: '8px',
        border: 'none',
        outline: 'none',
    },
    container: {
        padding: '40px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
    },
    submitButton: {
        width: '30%',
        height: '48px',
        borderRadius: '8px',
        background: 'linear-gradient(to bottom, rgba(106, 76, 147, 0.80) 0%, rgba(32, 23, 45, 0.80) 116.11%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        marginTop: '24px',
    },
}; 