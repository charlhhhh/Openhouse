import React, { useState, useEffect } from 'react';
import { Button, Input, Divider, message } from 'antd';
import { CloseOutlined, MailOutlined, GoogleOutlined, ArrowLeftOutlined, GithubOutlined, AppleOutlined } from '@ant-design/icons';
import SMSVerifyCodeInput from './SMSVerifyCodeInput';
import { userSession } from "../../utils/UserSession";
import { create } from 'zustand';
import { authService } from '../../services/auth';

interface LoginSheetStore {
    isVisible: boolean;
    setVisible: (visible: boolean) => void;
}

export const useLoginSheet = create<LoginSheetStore>()((set) => ({
    isVisible: false,
    setVisible: (visible: boolean) => set({ isVisible: visible }),
}));

const SHEET_WIDTH = 840;
const SHEET_HEIGHT = 908;

interface LoginSheetProps {
    visible: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}

export default function LoginSheet({ visible, onClose, onLoginSuccess }: LoginSheetProps) {
    const [email, setEmail] = useState('');
    const [verificationCode] = useState(['', '', '', '']);
    const [showVerification, setShowVerification] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [shouldStartCountdown, setShouldStartCountdown] = useState(false);

    // 验证邮箱格式
    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // 监听邮箱变化
    useEffect(() => {
        setIsEmailValid(validateEmail(email));
    }, [email]);

    // 重置所有状态
    const resetState = () => {
        setEmail('');
        setShowVerification(false);
        setIsLoading(false);
        setIsEmailValid(false);
        setShouldStartCountdown(false);
    };

    // 监听 visible 变化，当关闭时重置状态
    useEffect(() => {
        if (!visible) {
            resetState();
        }
    }, [visible]);

    const handleEmailSubmit = async () => {
        if (!isEmailValid) return;

        setIsLoading(true);
        try {
            // 发送验证码
            await authService.sendEmailCode(email);
            message.success('Verification Code Sent to Your Email');
            setShowVerification(true);
            setShouldStartCountdown(true);

        } catch (error) {
            message.error('Send Verification Code Failed, Please Try Again Later');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerificationSend = async () => {
        setIsLoading(true);
        try {
            // 重新发送验证码
            const response = await authService.sendEmailCode(email);
            if (response.code === 0) {
                message.success('Verification Code Re-sent to Your Email');
                setShouldStartCountdown(true);
            }
        } catch (error) {
            message.error('Send Verification Code Failed, Please Try Again Later');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerificationSubmit = async (code: string) => {
        if (!email || !code) {
            message.error('Email or Verification Code Cannot Be Empty');
            return;
        }
        setIsLoading(true);
        try {
            // 验证验证码
            const response = await authService.verifyEmailCode({
                email,
                code
            });

            if (response.data?.Token) {
                // 保存token
                authService.saveToken(response.data.Token);
                await authService.getUserProfile();
                userSession.setSession(response.data.Token);
                message.success('Login Success');
                onLoginSuccess();
                // 重置状态
                resetState();
            } else {
                message.error('Verification Failed, Please Check the Verification Code');
            }
        } catch (error) {
            message.error('Verification Failed, Please Try Again');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGitHubLogin = () => {
        // 重定向到Github认证页面
        window.location.href = authService.getGithubAuthUrl();
    };

    const handleGoogleLogin = async () => {
        // 添加谷歌登录逻辑
        window.location.href = authService.getGoogleAuthUrl();
    };

    const isButtonEnabled = showVerification
        ? verificationCode.every(code => code)
        : isEmailValid;

    if (!visible) return null;

    return (
        // <div style={styles.modalContainer}>
        <div style={styles.sheetContainer}>
            <div style={styles.backgroundImage}>
                <div style={styles.content}>
                    {!showVerification ? (
                        <>
                            <h1 style={styles.title}>Welcome to OpenHouse</h1>
                            <p style={styles.subtitle}>Sign in to continue</p>

                            <div style={styles.inputContainer}>
                                <MailOutlined style={{ marginRight: 12, fontSize: '24px', color: '#A0A1A5' }} />
                                <Input
                                    style={styles.input}
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    type="email"
                                />
                            </div>

                            <Button
                                style={{
                                    ...styles.button,
                                    ...(!isEmailValid && styles.buttonDisabled),
                                    background: 'linear-gradient(to bottom, rgba(106, 76, 147, 0.80) 0%, rgba(32, 23, 45, 0.80) 116.11%)'
                                }}
                                onClick={handleEmailSubmit}
                                disabled={!isEmailValid || isLoading}
                            >
                                <span style={styles.buttonText}>Continue with email</span>
                            </Button>

                            {/* <Divider orientation="center">or</Divider> */}

                            <Button
                                style={{
                                    ...styles.button,
                                    ...styles.googleButton,
                                    background: 'linear-gradient(to bottom, rgba(106, 76, 147, 0.80) 0%, rgba(32, 23, 45, 0.80) 116.11%)'
                                }}
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                                icon={<GoogleOutlined style={{ marginRight: 8, fontSize: '20px', color: '#fff' }} />}
                            >
                                <span style={styles.buttonText}>Continue with Google</span>
                            </Button>

                            <Button
                                style={{
                                    ...styles.button,
                                    ...styles.googleButton,
                                    background: 'linear-gradient(to bottom, rgba(106, 76, 147, 0.80) 0%, rgba(32, 23, 45, 0.80) 116.11%)'
                                }}
                                onClick={handleGitHubLogin}
                                disabled={isLoading}
                                icon={<GithubOutlined style={{ marginRight: 8, fontSize: '20px', color: '#fff' }} />}
                            >
                                <span style={styles.buttonText}>Continue with Github</span>
                            </Button>

                        </>
                    ) : (
                        <>
                            <h1 style={styles.title}>Enter verification code</h1>
                            <p style={styles.subtitle}>We sent a code to {email}</p>

                            <div style={styles.verificationContainer}>
                                <SMSVerifyCodeInput
                                    onInputCompleted={handleVerificationSubmit}
                                    onVerificationSend={handleVerificationSend}
                                    autoStartCountdown={shouldStartCountdown}
                                />
                            </div>

                            <div style={styles.backButtonContainer}>
                                <Button
                                    style={styles.backButton}
                                    onClick={() => setShowVerification(false)}
                                    type="text"
                                    icon={<ArrowLeftOutlined style={{ fontSize: '20px', color: '#6A4C93' }} />}
                                >
                                    <span style={styles.backButtonText}>Back</span>
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
        // </div>
    );
}


// 使用 React.CSSProperties 确保类型安全
const styles: { [key: string]: React.CSSProperties } = {
    modalContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        // backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backgroundColor: 'transparent',
    },
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
        width: '455px',
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
    button: {
        height: '60px',
        width: '305px',
        borderRadius: '8px',
        marginTop: '10px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: 'none',
        cursor: 'pointer',
        margin: '5px auto',
        outline: 'none',
    },
    buttonDisabled: {
        cursor: 'not-allowed',
    },
    buttonText: {
        color: '#fff',
        fontSize: '18px',
        fontWeight: 600,
    },
    divider: {
        color: '#000000',
        borderTop: '1px solid #000000', // 明确添加分割线样式
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dividerText: {
        color: '#000000',
    },
    googleButton: {
        backgroundColor: 'transparent',
    },
    backButton: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '20px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
    },
    backButtonText: {
        color: '#6A4C93',
        fontSize: '16px',
        marginLeft: '8px',
    },
    verificationContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '12px',
    },
    backButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '20px',
    },
};