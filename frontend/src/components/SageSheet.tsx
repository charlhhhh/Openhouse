import React, { useEffect, useState, useRef } from 'react';
import { Modal, Button } from 'antd';
import styled from 'styled-components';
import { CloseOutlined } from '@ant-design/icons';
import NoHighlightButton from './NoHighlightButton';
import { authService } from '../services/auth';

const SHEET_WIDTH = 480;
const SHEET_HEIGHT = 486;
const BODY_WIDTH = 445;
const BODY_HEIGHT = 462;
const HEADER_OFFSET = 354;

interface SageSheetProps {
    visible: boolean;
    onClose: () => void;
}

const StyledModal = styled(Modal)`
    .ant-modal-content {
        box-shadow: none;
        padding: 0;
        background: transparent;
    }
`;

const SheetContainer = styled.div`
    width: ${SHEET_WIDTH}px;
    height: ${Math.max(SHEET_HEIGHT, BODY_HEIGHT + HEADER_OFFSET)}px;
    position: relative;
    overflow: visible;
`;

const Header = styled.div`
    width: ${SHEET_WIDTH}px;
    height: ${SHEET_HEIGHT}px;
    flex-shrink: 0;
    background: url(/sage_coins_header.png);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
`;

const Body = styled.div`
    width: ${BODY_WIDTH}px;
    min-height: ${BODY_HEIGHT}px;
    position: absolute;
    top: ${HEADER_OFFSET}px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    background: linear-gradient(180deg, rgba(197, 155, 124), rgba(255, 217, 160) , rgba(140, 94, 88) 100%);
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: drop-shadow(6px 4px 4px rgba(0, 0, 0, 0.25));
    z-index: 2;
    padding: 32px 0;
    box-sizing: border-box;
    gap: 24px;
    border-radius: 10px;
`;

const Title = styled.h1`
    color: #20172D;
    text-align: center;
    font-family: Inter;
    font-size: 20px;
    font-weight: 700;
    margin: 0;
`;

const AvatarDecoration = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    background-image: url(/sage_avator_decoration.png);
    background-color: transparent;
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    width: 180.914px;
    aspect-ratio: 180.91/160.67;
    margin: 0;
`;

const Avatar = styled.div`
    width: 69px;
    height: 66px;
    border-radius: 69.558px;
    border: 1px dashed #1D3332;
    background: linear-gradient(0deg, rgba(0, 0, 0, 0.20) 0%, rgba(0, 0, 0, 0.20) 100%);
    box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
`;

const CoinsContainer = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    margin: 0;
`;

const CoinText = styled.span`
    color: #20172D;
    text-align: right;
    font-family: Inter;
    font-size: 36px;
    font-weight: 500;
`;

const CoinIcon = styled.div`
    width: 56px;
    height: 56px;
    background: url(/sage_coin.png) lightgray -10.74px -10.784px / 136.986% 140.056% no-repeat;
    border-radius: 28px;
`;

const Description = styled.p`
    color: #20172D;
    text-align: center;
    font-family: Inter;
    font-size: 16px;
    font-weight: 500;
    margin: 0;
    padding: 0 45px;
    max-width: 100%;
`;

const Divider = styled.div`
    width: 80%;
    height: 2px;
    background: #000000;
    margin: 0;
`;

const WalletContainer = styled.div`
    width: 80%;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    margin: 0;
`;

const WalletTitle = styled.span`
    color: #20172D;
    font-family: Inter;
    font-size: 20px;
    font-weight: 500;
`;

const WalletDetailContainer = styled.div`
    padding: 0 45px;
    display: flex;
    flex-direction: row;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
`;

const WalletText = styled.span`
    color: #20172D;
    text-align: right;
    font-family: Inter;
    font-size: 20px;
    font-weight: 500;
`;

const WalletCoin = styled.div`
    width: 34px;
    height: 34px;
    background: url(/sage_coin.png) lightgray 50% / cover no-repeat;
    border-radius: 17px;
`;

const GetCoinButton = styled(Button)`
    border-radius: 10px;
    background: linear-gradient(96deg, rgba(106, 76, 147, 0.80) 45.49%, rgba(32, 23, 45, 0.80) 99.83%);
    color: #FFF;
    text-align: center;
    font-family: Inter;
    font-size: 16px;
    font-weight: 700;
    height: 48px;
    padding: 0 32px;
    border: none;
    margin: 0;

    &:hover {
        opacity: 0.9;
        background: linear-gradient(96deg, rgba(106, 76, 147, 0.80) 45.49%, rgba(32, 23, 45, 0.80) 99.83%);
        color: #FFF;
    }
    &:active,
    &:focus,
    &.ant-btn:active,
    &.ant-btn:focus,
    &.ant-btn:focus-visible,
    &:focus-visible {
        background: linear-gradient(96deg, rgba(106, 76, 147, 0.80) 45.49%, rgba(32, 23, 45, 0.80) 99.83%) !important;
        color: #FFF !important;
        box-shadow: none !important;
        outline: none !important;
        border: none !important;
    }
`;

export const SageSheet: React.FC<SageSheetProps> = ({ visible, onClose }) => {
    // 轮播文字数组
    const carouselTexts = [
        "The number of gold coins depends on many magic factors, such as how many people you have helped and the mood of the sage at that time.",
        "All your work can earn you a large amount of gold coins, including associate with academic papers or open-source projects. The sage helps you connect the world.",
        "As long as we keep moving forward in the pursuit of happiness, we can achieve our goals."
    ];

    // 获取当天key
    const getTodayKey = () => {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `sage_daily_coin_${y}${m}${d}`;
    };

    // 钱包金币余额
    const [coin, setCoin] = useState<number>(0);
    // 今日是否已领取
    const [claimed, setClaimed] = useState<boolean>(false);
    // 今日抽中的金币数
    const [drawCoin, setDrawCoin] = useState<number>(1);
    // 轮播文字index
    const [carouselIdx, setCarouselIdx] = useState<number>(0);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // 初始化状态
    useEffect(() => {
        if (!visible) return;
        // 获取金币余额
        const profileStr = localStorage.getItem('user_profile');
        if (profileStr) {
            try {
                const profile = JSON.parse(profileStr);
                setCoin(profile.coin || 0);
            } catch { }
        }
        // 判断今日是否已领取
        const todayKey = getTodayKey();
        const claimedValue = localStorage.getItem(todayKey);
        if (claimedValue) {
            setClaimed(true);
            setDrawCoin(Number(claimedValue));
        } else {
            // 未领取，随机抽奖
            const randomCoin = Math.floor(Math.random() * 5) + 1;
            setDrawCoin(randomCoin);
            setClaimed(false);
        }
        setCarouselIdx(0);
    }, [visible]);

    // 轮播逻辑
    useEffect(() => {
        if (claimed && visible) {
            intervalRef.current = setInterval(() => {
                setCarouselIdx(idx => (idx + 1) % carouselTexts.length);
            }, 3000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [claimed, visible]);

    // 领取金币
    const handleGetCoins = async () => {
        const todayKey = getTodayKey();
        localStorage.setItem(todayKey, String(drawCoin));
        // 更新钱包余额
        setCoin(c => c + drawCoin);
        // 更新user_profile缓存
        const profileStr = localStorage.getItem('user_profile');
        if (profileStr) {
            try {
                const profile = JSON.parse(profileStr);
                profile.coin = (profile.coin || 0) + drawCoin;
                await authService.updateUserProfile({
                    coin: profile.coin
                });
                localStorage.setItem('user_profile', JSON.stringify(profile));
            } catch { }
        }
        setClaimed(true);
    };

    return (
        <StyledModal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={SHEET_WIDTH}
            closeIcon={<CloseOutlined style={{ color: 'white' }} />}
        >
            <SheetContainer>
                <Header />
                <Body>
                    <Title>Today's Lucky Star</Title>
                    <AvatarDecoration>
                        <Avatar />
                    </AvatarDecoration>
                    {!claimed && (
                        <CoinsContainer>
                            <CoinText>{drawCoin}</CoinText>
                            <CoinIcon />
                            <CoinText>!</CoinText>
                        </CoinsContainer>
                    )}
                    <Description>
                        {claimed ? carouselTexts[carouselIdx] : 'The Sage will automatically distribute coins based on your contribution or post.'}
                    </Description>
                    <Divider />
                    <WalletContainer>
                        <WalletTitle>My Wallet</WalletTitle>
                        <WalletDetailContainer>
                            <WalletText>{coin}</WalletText>
                            <WalletCoin />
                        </WalletDetailContainer>
                    </WalletContainer>
                    {!claimed && (
                        <GetCoinButton onClick={handleGetCoins}>Get Coins</GetCoinButton>
                    )}
                </Body>
            </SheetContainer>
        </StyledModal>
    );
}; 