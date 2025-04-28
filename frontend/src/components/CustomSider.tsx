import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { SageSheet } from './SageSheet';

const { Sider } = Layout;

// 自定义样式组件
const StyledSider = styled(Sider)`
  background: #fff !important;
  height: 100vh;
  width: 340px;
  position: fixed;
  left: 0;
  top: 0;
  overflow: visible;
  z-index: 200;
`;

const DecorationImage = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 340px;
  height: 570px;
  pointer-events: none;
  background-color: 'transparent';
  z-index: 0;
  transform-origin: center center;
  aspect-ratio: 34/57;
`;

const DecorationImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
  position: absolute;
  bottom: 0;
  left: 0;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const LogoContainer = styled.div`
  padding: 44px 44px;
  align-items: center;
  img {
    width: 120px;
    height: auto;
  }

`;

const StyledMenu = styled(Menu)`
  background: transparent !important;
  border: none !important;
  padding: 0 16px;
  flex: 1;
  
  .ant-menu-item {
    height: 48px !important;
    line-height: 48px !important;
    margin: 25px 0 !important;
    padding: 0 16px !important;
    display: flex !important;
    align-items: center !important;
    
    &:last-child {
      margin-top: 80px !important;
    }

    &:hover {
      background: rgba(106, 76, 147, 0.1) !important;
    }

    &.ant-menu-item-selected {
      background: rgba(106, 76, 147, 0.1) !important;
      .menu-label {
        color: #6A4C93 !important;
      }
    }
  }
`;

const MenuItemContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

const MenuIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 12px;
  flex-shrink: 0;
`;

const MenuLabel = styled.span`
  font-size: 16px;
  color: #000;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const HighlightText = styled.span`
  color: #6A4C93;
  font-weight: 600;
`;

interface MenuItem {
    key: string;
    label: string;
    icon: string;
    highlight?: string;
}

const menuItems: MenuItem[] = [
    {
        key: '/',
        label: 'Home',
        icon: '/menu_items_home.svg'
    },
    {
        key: 'following',
        label: 'Following',
        icon: '/menu_items_following.svg'
    },
    {
        key: 'savedTopics',
        label: 'Saved Topics',
        icon: '/menu_items_saved.svg'
    },
    {
        key: 'sage',
        label: 'Sage AI',
        icon: '/menu_items_sage.svg',
        highlight: 'AI'
    },
    {
        key: 'findPartner',
        label: 'Find Your Partner',
        icon: '/menu_items_partner.svg'
    },
    {
        key: 'account',
        label: 'Account',
        icon: '/menu_items_account.svg'
    }
];

const CustomSider: React.FC = () => {
    const [sageSheetVisible, setSageSheetVisible] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleMenuClick = (key: string) => {
        if (key === '/sage') {
            setSageSheetVisible(true);
        } else {
            navigate(key);
        }
    };

    const renderMenuItem = (item: MenuItem) => {
        const label = item.highlight ? (
            <>
                {item.label.split(item.highlight)[0]}
                <HighlightText>{item.highlight}</HighlightText>
                {item.label.split(item.highlight)[1]}
            </>
        ) : item.label;

        return (
            <MenuItemContent>
                <MenuIcon style={{ width: '45px', height: '45px' }} src={item.icon} alt={item.label} />
                <MenuLabel>{label}</MenuLabel>
            </MenuItemContent>
        );
    };

    return (
        <StyledSider width={340}>
            <DecorationImage>
                <img src="/menu_border.png" alt="decoration" />
            </DecorationImage>
            <ContentWrapper>
                <LogoContainer>
                    <img src="/home_logo.png" style={{ width: '100%', height: 'auto' }} alt="Logo" />
                </LogoContainer>
                <StyledMenu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    onClick={({ key }) => handleMenuClick(key)}
                    items={menuItems.map(item => ({
                        key: item.key,
                        label: renderMenuItem(item)
                    }))}
                />
            </ContentWrapper>
            <SageSheet
                visible={sageSheetVisible}
                onClose={() => setSageSheetVisible(false)}
            />
        </StyledSider>
    );
};

export default CustomSider; 