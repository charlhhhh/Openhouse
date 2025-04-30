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

    // 处理粘贴事件
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        // 只接受数字
        const numbers = pastedData.replace(/[^\d]/g, '').split('').slice(0, CODE_LENGTH);

        if (numbers.length > 0) {
            const newCode = [...code];
            numbers.forEach((num, index) => {
                if (index < CODE_LENGTH) {
                    newCode[index] = num;
                }
            });
            setCode(newCode);
            setActiveIndex(Math.min(numbers.length, CODE_LENGTH - 1));

            // 如果粘贴的数字长度等于验证码长度，触发完成回调
            if (numbers.length === CODE_LENGTH) {
                onInputCompleted(numbers.join(''));
            }
        }
    };

    // 处理验证码输入和退格键
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace') {
            if (activeIndex > 0) {
                const newCode = [...code];
                newCode[activeIndex - 1] = '';
                setCode(newCode);
                setActiveIndex(activeIndex - 1);
            } else if (activeIndex === 0 && code[0] !== '') {
                const newCode = [...code];
                newCode[0] = '';
                setCode(newCode);
            }
        } else if (/^[0-9]$/.test(e.key)) {
            const newCode = [...code];
            newCode[activeIndex] = e.key;
            setCode(newCode);

            // 如果当前不是最后一个位置，自动前进
            if (activeIndex < CODE_LENGTH - 1) {
                setActiveIndex(activeIndex + 1);
            }

            // 检查是否输入完成
            const isComplete = newCode.every(c => c !== '');
            if (isComplete) {
                onInputCompleted(newCode.join(''));
            }
        }
    };

    // 处理输入框值变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, '').slice(0, CODE_LENGTH);
        const newCode = Array(CODE_LENGTH).fill('');
        value.split('').forEach((char, index) => {
            if (index < CODE_LENGTH) {
                newCode[index] = char;
            }
        });
        setCode(newCode);
        setActiveIndex(Math.min(value.length, CODE_LENGTH - 1));

        // 如果输入长度等于验证码长度，触发完成回调
        if (value.length === CODE_LENGTH) {
            onInputCompleted(value);
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
                onChange={handleInputChange}
                onPaste={handlePaste}
                maxLength={CODE_LENGTH}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
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