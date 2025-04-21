import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, KeyboardAvoidingView, Platform, ImageBackground, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import SMSVerifyCodeInput from './SMSVerifyCodeInput';

const SHEET_WIDTH = 840;
const SHEET_HEIGHT = 908;

// 配置Google登录
GoogleSignin.configure({
    webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // 需要替换为您的Google OAuth客户端ID
});

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

    const handleEmailSubmit = async () => {
        if (!email) return;

        setIsLoading(true);
        try {
            // TODO: 发送验证码到邮箱
            console.log('发送验证码到:', email);
            setShowVerification(true);
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
            console.log('重新发送验证码到:', email);
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
            onLoginSuccess();
        } catch (error) {
            console.error('验证失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setIsLoading(true);
        try {
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            console.log('Google登录成功:', userInfo);
            onLoginSuccess();
        } catch (error) {
            console.error('Google登录失败:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isButtonEnabled = showVerification
        ? verificationCode.every(code => code)
        : email;

    if (!visible) return null;

    return (
        <div style={styles.modalContainer}>
            <div style={styles.sheetContainer}>
                <div style={styles.backgroundImage}>
                    <div style={styles.header}>
                        <button onClick={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#fff" />
                        </button>
                    </div>

                    <div style={styles.content}>
                        {!showVerification ? (
                            <>
                                <h1 style={styles.title}>Welcome to OpenHouse</h1>
                                <p style={styles.subtitle}>Sign in to continue</p>

                                <div style={styles.inputContainer}>
                                    <Ionicons name="mail-outline" size={24} color="#A0A1A5" style={{ marginRight: 12 }} />
                                    <input
                                        style={styles.input}
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        type="email"
                                        autoCapitalize="none"
                                    />
                                </div>

                                <button
                                    style={{
                                        ...styles.button,
                                        ...(!isButtonEnabled && styles.buttonDisabled)
                                    } as React.CSSProperties}
                                    onClick={handleEmailSubmit}
                                    disabled={!isButtonEnabled || isLoading}
                                >
                                    <LinearGradient
                                        colors={['#6A4C93', '#20172D']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                    >
                                        <span style={styles.buttonText}>Continue with email</span>
                                    </LinearGradient>
                                </button>

                                <div style={styles.divider}>
                                    <div style={styles.dividerLine} />
                                    <span style={styles.dividerText}>or</span>
                                    <div style={styles.dividerLine} />
                                </div>

                                <button
                                    style={{
                                        ...styles.button,
                                        ...styles.googleButton
                                    } as React.CSSProperties}
                                    onClick={handleEmailSubmit}
                                    disabled={!isButtonEnabled || isLoading}
                                >
                                    <LinearGradient
                                        colors={['#6A4C93', '#20172D']}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 0, y: 1 }}
                                    >
                                        <Ionicons name="logo-google" size={20} color="#fff" style={{ marginRight: 8 }} />
                                        <span style={styles.buttonText}>Continue with Google</span>
                                    </LinearGradient>
                                </button>
                            </>
                        ) : (
                            <>
                                <h1 style={styles.title}>Enter verification code</h1>
                                <p style={styles.subtitle}>We sent a code to {email}</p>

                                <SMSVerifyCodeInput
                                    onInputCompleted={handleVerificationSubmit}
                                    onVerificationSend={handleVerificationSend}
                                />

                                <button
                                    style={styles.backButton}
                                    onClick={() => setShowVerification(false)}
                                >
                                    <Ionicons name="arrow-back" size={20} color="#6A4C93" />
                                    <span style={styles.backButtonText}>Back</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


// 使用 React.CSSProperties 确保类型安全
const styles: { [key: string]: React.CSSProperties } = {
    modalContainer: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
    },
    sheetContainer: {
        width: SHEET_WIDTH,
        height: SHEET_HEIGHT,
        borderRadius: '20px',
        overflow: 'hidden',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        backgroundImage: 'url(../../assets/images/bg_login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
        padding: '0 40px',
        paddingTop: `calc(${SHEET_HEIGHT} * 0.35)`,
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
        color: '#A7A8D9',
        marginBottom: '40px',
        textAlign: 'center',
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        marginBottom: '20px',
        padding: '0 16px',
        width: '60%',
        margin: '0 auto',
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
        borderRadius: '8px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: 'none',
        cursor: 'pointer',
        width: '50%',
        margin: '0 auto',
    },
    buttonDisabled: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        cursor: 'not-allowed',
    },
    buttonText: {
        color: '#fff',
        fontSize: '18px',
        fontWeight: 600,
    },
    divider: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        margin: '20px 60px',
    },
    dividerLine: {
        flex: 1,
        height: '1px',
        backgroundColor: '#6A4C93',
    },
    dividerText: {
        margin: '0 16px',
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
};