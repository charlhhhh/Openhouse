import React, { useState, useEffect } from 'react';
import { Button, Input, Divider, message } from 'antd';
import { CloseOutlined, MailOutlined, GoogleOutlined, ArrowLeftOutlined, GithubOutlined, AppleOutlined } from '@ant-design/icons';
import SMSVerifyCodeInput from './SMSVerifyCodeInput';
import { supabase } from '../../supabase/client';
import { userSession } from "../../utils/UserSession";


import { Provider } from '@supabase/supabase-js';


const SHEET_WIDTH = 840;
const SHEET_HEIGHT = 908;

interface LoginSheetProps {
    visible: boolean;
    onClose: () => void;
    onLoginSuccess: () => void;
}




supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
        const { id, email } = session.user;
        // 保存session信息
        userSession.setSession(id, email ?? "");
        // 查询用户资料
        const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', id).single()
        if (error) {
            console.error('获取用户资料失败:', error);
            return;
        }
        if (profile) {
            console.log('更新用户资料:', profile);
            userSession.updateProfile(profile);
        }
    } else if (event === 'SIGNED_OUT') {
        userSession.clearSession();
    }
});

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
    // 监听登录状态变化
    useEffect(() => {
        const handleLoginStateChange = () => {
            const session = userSession.getSession()
            // 如果用户已登录但没有个人资料，显示资料创建面板
            if (session) {
                onLoginSuccess();
            }
        };
        // 初始化时检查登录状态
        handleLoginStateChange();
        // 添加登录状态变化监听
        userSession.addListener(handleLoginStateChange);
        // 清理监听器
        return () => {
            userSession.removeListener(handleLoginStateChange);
        };
    }, []);

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
            // TODO: 发送验证码到邮箱
            console.log('发送验证码到:', email);
            setShowVerification(true);
            setShouldStartCountdown(true);
            // handleVerificationSend();
        } catch (error) {
            console.error('发送验证码失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerificationSend = async () => {
        setIsLoading(true);
        try {
            // TODO: 重新发送验证码
            console.log('发送验证码到:', email);
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
                console.error('发送验证码失败:', error);
            } else {
                console.log('验证码发送成功');
            }

        } catch (error) {
            console.error('发送验证码失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerificationSubmit = async (code: string) => {
        setIsLoading(true);
        try {
            // TODO: 验证验证码
            console.log('验证验证码:', code);
            const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' })
            if (error) {
                console.error('验证失败:', error);
                message.warning(error?.message ?? '验证失败');
            } else {
                console.log('验证成功');
                //  onLoginSuccess();
            }
            // onLoginSuccess();
        } catch (error) {
            console.error('验证失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleThirdPartyLogin = async (thirdParty: string) => {
        // 添加谷歌登录逻辑
        setIsLoading(true);
        try {
            console.log('登录', thirdParty);
            const { error } = await supabase.auth.signInWithOAuth({
                provider: thirdParty as Provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            if (error) {
                console.error('登录失败:', error);
            } else {
                console.log('登录成功');
            }
        } catch (error) {
            console.error('登录失败:', error);
        } finally {
            setIsLoading(false);
        }
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
                                onClick={() => handleThirdPartyLogin('google')}
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
                                onClick={() => handleThirdPartyLogin('github')}
                                disabled={isLoading}
                                icon={<GithubOutlined style={{ marginRight: 8, fontSize: '20px', color: '#fff' }} />}
                            >
                                <span style={styles.buttonText}>Continue with Github</span>
                            </Button>
                            <Button
                                style={{
                                    ...styles.button,
                                    ...styles.googleButton,
                                    background: 'linear-gradient(to bottom, rgba(106, 76, 147, 0.80) 0%, rgba(32, 23, 45, 0.80) 116.11%)'
                                }}
                                onClick={() => handleThirdPartyLogin('microsoft')}
                                disabled={isLoading}
                            // icon={<AppleOutlined style={{ marginRight: 8, fontSize: '20px', color: '#fff' }} />}
                            >
                                <span style={styles.buttonText}>Continue with Microsoft</span>
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