import React from 'react';
import { Modal, Button } from 'antd';
import styled from 'styled-components';
import { CloseOutlined } from '@ant-design/icons';

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
`;

export const SageSheet: React.FC<SageSheetProps> = ({ visible, onClose }) => {
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
                    <CoinsContainer>
                        <CoinText>1</CoinText>
                        <CoinIcon />
                        <CoinText>!</CoinText>
                    </CoinsContainer>
                    <Description>
                        The Sage will automatically distribute coins based on your contribution or post.
                    </Description>
                    <Divider />
                    <WalletContainer>
                        <WalletTitle>My Wallet</WalletTitle>
                        <WalletDetailContainer>
                            <WalletText>2</WalletText>
                            <WalletCoin />
                        </WalletDetailContainer>
                    </WalletContainer>
                    <GetCoinButton>Get Coins</GetCoinButton>
                </Body>
            </SheetContainer>
        </StyledModal>
    );
}; 