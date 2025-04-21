import React, { useState, useRef, useEffect } from 'react';
import { Button, Input, Typography } from 'antd';
import type { InputRef } from 'antd';

const { Text } = Typography;

const CODE_LENGTH = 4;
const CELL_SIZE = 84;
const COUNTDOWN_SECONDS = 60;

interface SMSVerifyCodeInputProps {
    onInputCompleted: (code: string) => void;
    onVerificationSend: () => void;
}

export default function SMSVerifyCodeInput({ onInputCompleted, onVerificationSend }: SMSVerifyCodeInputProps) {
    const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(''));
    const [activeIndex, setActiveIndex] = useState(0);
    const [countdown, setCountdown] = useState(0);
    const inputRef = useRef<InputRef>(null);
    const countdownRef = useRef<number | null>(null);

    // 处理验证码输入
    const handleCodeChange = (text: string) => {
        // 只允许输入数字
        const newText = text.replace(/[^0-9]/g, '');
        
        // 如果输入长度超过剩余位数，只取需要的位数
        const newCode = [...code];
        const remainingLength = CODE_LENGTH - activeIndex;
        const inputLength = Math.min(newText.length, remainingLength);

        for (let i = 0; i < inputLength; i++) {
            newCode[activeIndex + i] = newText[i];
        }

        setCode(newCode);

        // 更新当前激活的输入框索引
        const nextIndex = Math.min(activeIndex + inputLength, CODE_LENGTH - 1);
        setActiveIndex(nextIndex);

        // 如果输入完成，触发回调
        if (newCode.every(c => c !== '') && newCode.length === CODE_LENGTH) {
            onInputCompleted(newCode.join(''));
        }
    };

    // 处理退格键
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
            
            // 如果输入完成，触发回调
            if (newCode.every(c => c !== '') && newCode.length === CODE_LENGTH) {
                onInputCompleted(newCode.join(''));
            }
        }
    };

    // 处理单元格点击
    const handleCellPress = (index: number) => {
        setActiveIndex(index);
        inputRef.current?.focus();
    };

    // 处理发送验证码
    const handleSendVerification = () => {
        if (countdown > 0) return;

        onVerificationSend();
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

    // 清理倒计时
    useEffect(() => {
        return () => {
            if (countdownRef.current) {
                window.clearInterval(countdownRef.current);
            }
        };
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
                onChange={(e) => handleCodeChange(e.target.value)}
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
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    container: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
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
        width: CELL_SIZE * CODE_LENGTH + 12 * (CODE_LENGTH - 1),
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
}; 