import React, { useState } from 'react';
import { Modal, Input, Button, message } from 'antd';
import { supabase } from '../../supabase/client';
import { userSession } from '../../utils/UserSession';
import { UserProfile } from '../../types/user';
import {
    CloseOutlined,
    MailOutlined,
} from "@ant-design/icons";
import { authService } from '../../services/auth';
// import swot from 'swot-js';

interface UserProfileCreateSheetProps {
    visible: boolean;
    onClose: () => void;
    email: string;
    isGithubBind: boolean;
    isGoogleBind: boolean;
    isEmailBind: boolean;
}

const SHEET_WIDTH = 840;
const SHEET_HEIGHT = 908;

export const UserLinkAuthSheet: React.FC<UserProfileCreateSheetProps> = ({
    visible,
    onClose,
    email,
    isGithubBind,
    isGoogleBind,
    isEmailBind
}) => {
    const [nickname, setNickname] = useState('');
    const [githubUsername, setGithubUsername] = useState('');
    const [researchAreas, setResearchAreas] = useState('');
    // const [schoolEmail, setSchoolEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createProfileModalVisible, setCreateProfileModalVisible] = useState(true);
    const handleCreateProfileCancel = () => {
        setCreateProfileModalVisible(false);
        onClose();
    }

    const handleGithubBind = () => {
        const token = localStorage.getItem('token');
        window.location.href = `https://github.com/login/oauth/authorize?scope=user:email&client_id=Ov23liKlSNhwhBevQPD7&redirect_uri=http://openhouse.horik.cn/api/v1/auth/github/callback?state=${token}`;
    }

    const handleGoogleBind = () => {
        const token = localStorage.getItem('token');
        window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=1096406563590-dg8skdq3ook05s6hj2s9s41arvhj4l4s.apps.googleusercontent.com&redirect_uri=http://openhouse.horik.cn/api/v1/auth/google/callback&response_type=code&scope=https://www.googleapis.com/auth/userinfo.email+https://www.googleapis.com/auth/userinfo.profile+openid&state=${token}`;
    }

    // const handleSchoolEmailBind = async () => {
    //     setIsSubmitting(true);
    //     const isAcademic = swot(email);
    //     console.log('isAcademic', isAcademic);
    //     if (isAcademic) {
    //         try {
    //             await authService.updateUserProfile({
    //                 is_verified: true,
    //                 is_email_bound: true,
    //             })
    //             message.success('Bind school email successfully');
    //         } catch (error) {
    //             message.error('Fail to bind school email');
    //         } finally {
    //             message.error('Fail to bind school email, please try again later.');
    //         }
    //     } else {
    //         console.log('不是学术邮箱');
    //         message.error('You email is not academic, please use your school email to bind.');
    //     }
    //     setIsSubmitting(false);
    // }

    const handleSkip = () => {
        onClose();
    }

    return (
        <Modal
            open={visible}
            onCancel={handleCreateProfileCancel}
            onClose={onClose}
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

                        <Button
                            style={styles.inputContainer}
                            onClick={handleGithubBind}
                            disabled={isGithubBind}
                        >
                            {isGithubBind ? 'Bind Github Already' : 'Bind Github Account'}
                        </Button>

                        <Button
                            style={styles.inputContainer}
                            onClick={handleGoogleBind}
                            disabled={isGoogleBind}
                        >
                            {isGoogleBind ? 'Bind Google Already' : 'Bind Google Account'}
                        </Button>

                        {/* <Button style={styles.inputContainer}
                            onClick={handleSchoolEmailBind}
                            disabled={isEmailBind}
                        >
                            {isEmailBind ? '已绑定学校邮箱' : '学校邮箱绑定'}
                        </Button> */}
                        <Button style={styles.skipButton}
                            onClick={handleSkip}
                        >
                            Skip for now
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
    //     color: #A0A1A5;
    // font-family: "Open Sans";
    // font-size: 24px;
    // font-style: normal;
    // font-weight: 400;
    // line-height: normal;
    inputContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        // marginBottom: '18px',
        padding: '0 16px',
        width: '50%',
        height: '65px',
        margin: '10px auto',
        boxShadow: '6px 7px 12.8px 0px rgba(0, 0, 0, 0.25)',
        color: '#A0A1A5',
        fontFamily: 'Open Sans',
        fontSize: '18px',
        fontStyle: 'normal',
        fontWeight: '400',
        lineHeight: 'normal',
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
    skipButton: {
        width: '35%',
        height: '48px',
        borderRadius: '8px',
        background: 'linear-gradient(to bottom, rgba(106, 76, 147, 0.80) 0%, rgba(32, 23, 45, 0.80) 116.11%)',
        color: '#fff',
        fontSize: '16px',
        fontWeight: 600,
        marginTop: '24px',
    },
}; 