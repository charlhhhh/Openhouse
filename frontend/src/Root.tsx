import { Modal, Button, message } from "antd";
import { useState, useEffect } from "react";
import { UserOutlined, CloseOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { Outlet, useNavigate } from "react-router-dom";
import LoginSheet from "./pages/login/LoginSheet";
import { UserLinkAuthSheet } from "./pages/profile/UserLinkAuthSheet";
import { userSession } from "./utils/UserSession";
import CustomSider from "./components/CustomSider";
import TopBar from './components/TopBar';
import { supabase } from "./supabase/client";
import warning from "antd/es/_util/warning";
import styled from 'styled-components';

const SHEET_WIDTH = 840;

const StyledLayout = styled(Layout)`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
`;

const MainLayout = styled(Layout)`
  position: relative;
  height: 100vh;
  margin-left: 340px;
`;

const FixedTopBar = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  left: 340px;
  z-index: 100;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

const ScrollableContent = styled(Content)`
  margin-top: 64px;
  height: calc(100vh - 64px);
  overflow-y: auto;
  background-color: #F7F2ECCC;
  padding: 24px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(106, 76, 147, 0.3);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
`;

// supabase.auth.onAuthStateChange(async (event, session) => {
//   if (event === 'SIGNED_IN' && session) {
//     const { id, email } = session.user;
//     // 保存session信息
//     userSession.setSession(id, email ?? "");
//     // 查询用户资料
//     const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', id).single()
//     if (error) {
//       console.error('获取用户资料失败:', error);
//       return;
//     }
//     if (profile) {
//       console.log('更新用户资料:', profile);
//       userSession.updateProfile(profile);
//     }
//   } else if (event === 'SIGNED_OUT') {
//     userSession.clearSession();
//   }
// });

export default function Root() {
  const navigate = useNavigate();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const showLoginModal = () => {
    setLoginModalVisible(true);
  };

  const handleLoginCancel = () => {
    setLoginModalVisible(false);
  };


  return (
    <StyledLayout>
      <CustomSider />
      <MainLayout>
        <FixedTopBar>
          <TopBar onShowLogin={showLoginModal} />
        </FixedTopBar>
        <ScrollableContent>
          <Outlet />
        </ScrollableContent>
      </MainLayout>

      {/* 登录面板 */}
      <Modal
        open={loginModalVisible}
        onCancel={handleLoginCancel}
        footer={null}
        styles={{
          content: {
            padding: 0,
            width: SHEET_WIDTH,
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        }}
        closeIcon={<CloseOutlined style={{ color: 'white' }} />}
      >
        <LoginSheet
          visible={loginModalVisible}
          onClose={handleLoginCancel}
          onLoginSuccess={async () => {
            message.success('onLoginSuccess');
            setLoginModalVisible(false);
            // TODO: 登录成功后，验证三方认证逻辑
          }}
        />
      </Modal>

    </StyledLayout>
  );
}
