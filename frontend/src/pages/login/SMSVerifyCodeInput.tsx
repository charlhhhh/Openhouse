import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, StyleSheet, Dimensions, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
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
    const inputRef = useRef<TextInput>(null);
    const countdownRef = useRef<number | undefined>(null);


    // 处理验证码输入
    const handleCodeChange = (text: string) => {
        // 只允许输入数字
        const newText = text.replace(/[^0-9]/g, '');
        console.log('newText', newText);
        // 如果输入长度超过剩余位数，只取需要的位数
        const newCode = [...code];
        const remainingLength = CODE_LENGTH - activeIndex;
        const inputLength = Math.min(newText.length, remainingLength);

        for (let i = 0; i < inputLength; i++) {
            newCode[i] = newText[i];
        }

        setCode(newCode);

        // 更新当前激活的输入框索引
        const nextIndex = Math.min(activeIndex + 1, CODE_LENGTH - 1);
        setActiveIndex(nextIndex);

        // 如果输入完成，触发回调
        if (nextIndex === CODE_LENGTH - 1 && newCode.every(c => c !== '')) {
            onInputCompleted(newCode.join(''));
        }
    };

    // 处理退格键
    const handleKeyPress = ({ nativeEvent }: { nativeEvent: { key: string } }) => {
        if (nativeEvent.key === 'Backspace' && activeIndex >= 0) {
            const newCode = [...code];
            newCode[activeIndex] = '';
            setCode(newCode);
            setActiveIndex(activeIndex - 1);
        }
        if (nativeEvent.key >= '0' && nativeEvent.key <= '9') {
            const newCode = [...code];
            newCode[activeIndex] = nativeEvent.key;
            setCode(newCode);
            const nextIndex = Math.min(activeIndex + 1, CODE_LENGTH - 1);
            setActiveIndex(nextIndex);
            if (nextIndex === CODE_LENGTH - 1 && newCode.every(c => c !== '')) {
                onInputCompleted(newCode.join(''));
            }
        }
        console.log('key press', nativeEvent.key);
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
                        countdownRef.current = undefined;
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
        <View style={styles.container}>
            <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={code.join('')}
                onKeyPress={handleKeyPress}
                keyboardType="number-pad"
                maxLength={CODE_LENGTH}
            />
            <View style={styles.inputContainer}>
                <View style={styles.cellsContainer}>
                    {code.map((digit, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => handleCellPress(index)}
                            activeOpacity={0.7}
                        >
                            <View
                                style={[
                                    styles.cell,
                                    index === activeIndex && styles.activeCell
                                ]}
                            >
                                <View style={styles.digitContainer}>
                                    <Text style={styles.digit}>{digit}</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
                <TouchableOpacity
                    style={[styles.sendButton, countdown > 0 && styles.sendButtonDisabled]}
                    onPress={handleSendVerification}
                    disabled={countdown > 0}
                >

                    <Text style={styles.sendButtonText}>
                        {countdown > 0 ? `${countdown}s Resend` : 'Send'}
                    </Text>

                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
        flexDirection: 'row',
        alignItems: 'center',
    },
    cellsContainer: {
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeCell: {
        borderWidth: 2,
        borderColor: '#6A4C93',
    },
    digitContainer: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    digit: {
        fontSize: 32,
        color: '#fff',
    },
    sendButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: 120,
        height: 60,
        borderRadius: 8,
        marginLeft: 8,
        overflow: 'hidden',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonText: {
        fontFamily: 'Inter',
        color: '#000000',
        fontSize: 18,
        fontWeight: '400',
        textDecorationLine: 'underline',
    },
}); 