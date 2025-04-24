import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Typography } from 'antd';
import type { InputRef } from 'antd';

const { Text } = Typography;

const CODE_LENGTH = 6;
const CELL_SIZE = 66;
const COUNTDOWN_SECONDS = 60;
const CELL_CONTAINER_WIDTH = CELL_SIZE * CODE_LENGTH + 5 * (CODE_LENGTH - 1);
const SHEET_WIDTH = 840;

interface SMSVerifyCodeInputProps {
    onInputCompleted: (code: string) => void;
    onVerificationSend: () => void;
    autoStartCountdown?: boolean;
}

export default function SMSVerifyCodeInput({ onInputCompleted, onVerificationSend, autoStartCountdown = false }: SMSVerifyCodeInputProps) {
    const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [activeIndex, setActiveIndex] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const inputRef = useRef<InputRef>(null);
    const countdownRef = useRef<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 处理验证码输入和退格键
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && activeIndex > 0) {
            const newCode = [...code];
            newCode[activeIndex - 1] = '';
            setCode(newCode);
            setActiveIndex(Math.max(0, activeIndex - 1));
        } else if (e.key >= '0' && e.key <= '9') {
            const newCode = [...code];
            newCode[activeIndex] = e.key;
            setCode(newCode);
            const nextIndex = Math.min(activeIndex + 1, CODE_LENGTH - 1);
            setActiveIndex(nextIndex);
            console.log('newCode:', code);
            // 如果输入完成，触发回调
            // if (newCode.every(c => c !== '') && newCode.length === CODE_LENGTH) {
            //     onInputCompleted(newCode.join(''));
            // }
        }
    };

    // 处理单元格点击
    const handleCellPress = (index: number) => {
        setActiveIndex(index);
        inputRef.current?.focus();
    };

    const startAutoCountdown = () => {
        setCountdown(COUNTDOWN_SECONDS);
        countdownRef.current = window.setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    if (countdownRef.current) {
                        window.clearInterval(countdownRef.current);
                        countdownRef.current = null;
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // 处理发送验证码
    const handleSendVerification = () => {
        if (countdown > 0) return;

        onVerificationSend();
        startAutoCountdown();
        // setCountdown(COUNTDOWN_SECONDS);

        // countdownRef.current = window.setInterval(() => {
        //     setCountdown(prev => {
        //         if (prev <= 1) {
        //             if (countdownRef.current) {
        //                 window.clearInterval(countdownRef.current);
        //                 countdownRef.current = null;
        //             }
        //             return 0;
        //         }
        //         return prev - 1;
        //     });
        // }, 1000);
    };

    // 清理倒计时
    useEffect(() => {
        return () => {
            if (countdownRef.current) {
                window.clearInterval(countdownRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (autoStartCountdown) {
            startAutoCountdown();
        }
    }, []);

    // 聚焦输入框
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <div style={styles.container}>
            <Input
                ref={inputRef}
                style={styles.hiddenInput}
                value={code.join('')}
                onKeyDown={handleKeyPress}
                maxLength={CODE_LENGTH}
                type="text"
            />
            <div style={styles.inputContainer}>
                <div style={styles.cellsContainer}>
                    {code.map((digit, index) => (
                        <div
                            key={index}
                            onClick={() => handleCellPress(index)}
                            style={{
                                cursor: 'pointer',
                            }}
                        >
                            <div
                                style={{
                                    ...styles.cell,
                                    ...(index === activeIndex ? styles.activeCell : {})
                                }}
                            >
                                <div style={styles.digitContainer}>
                                    <Text style={styles.digit}>{digit}</Text>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            <Button
                style={{
                    ...styles.button,
                    ...(styles.buttonDisabled),
                    background: 'linear-gradient(to bottom, rgba(106, 76, 147, 0.80) 0%, rgba(32, 23, 45, 0.80) 116.11%)'
                }}
                onClick={() => { setIsLoading(true); onInputCompleted(code.join('')) }}
                disabled={!(code.every(c => c !== '') && code.length === CODE_LENGTH)}
            >
                <span style={styles.buttonText}>Login</span>
            </Button>
            <Button
                style={{
                    ...styles.sendButton,
                    ...(countdown > 0 ? styles.sendButtonDisabled : {})
                }}
                onClick={handleSendVerification}
                disabled={countdown > 0}
                type="link"
            >
                <Text style={styles.sendButtonText}>
                    {countdown > 0 ? `${countdown}s Resend` : 'Send'}
                </Text>
            </Button>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    inputContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    cellsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: CELL_CONTAINER_WIDTH,
    },
    cell: {
        width: CELL_SIZE,
        height: CELL_SIZE,
        backgroundColor: '#ffffff',
        boxShadow: '6px 7px 12.8px 0px rgba(0, 0, 0, 0.25)',
        borderRadius: 12,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeCell: {
        borderWidth: 2,
        borderColor: '#6A4C93',
        border: '2px solid #6A4C93',
    },
    digitContainer: {
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    digit: {
        fontSize: 32,
        color: '#000',
    },
    sendButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        height: 60,
        borderRadius: 8,
        marginLeft: 8,
        overflow: 'hidden',
        border: 'none',
        outline: 'none',
        cursor: 'pointer',
    },
    sendButtonDisabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
    },
    sendButtonText: {
        color: '#000000',
        fontSize: 18,
        fontWeight: '400',
        textDecoration: 'underline',
    },
    button: {
        height: '49px',
        width: '158px',
        borderRadius: '8px',
        marginTop: '35px',
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        border: 'none',
        cursor: 'pointer',
        outline: 'none',
        color: '#fff',
    },
    buttonDisabled: {
        cursor: 'not-allowed',
    },
}; 