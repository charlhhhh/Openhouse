import { Modal, Button, message } from "antd";
import { useState, useEffect } from "react";
import { UserOutlined, CloseOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { Outlet, useNavigate } from "react-router-dom";
import LoginSheet from "./pages/login/LoginSheet";
import { UserProfileCreateSheet } from "./pages/profile/UserLinkAuthSheet";
import { userSession } from "./utils/UserSession";
import CustomSider from "./components/CustomSider";
import TopBar from './components/TopBar';
import { supabase } from "./supabase/client";
import warning from "antd/es/_util/warning";

const SHEET_WIDTH = 840;

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
  const [profileSheetVisible, setProfileSheetVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);


  const showLoginModal = () => {
    setLoginModalVisible(true);
  };

  const handleLoginCancel = () => {
    setLoginModalVisible(false);
  };

  const handleProfileSheetClose = () => {
    setProfileSheetVisible(false);
  };

  return (
    <Layout className="h-screen w-screen">
      <CustomSider />
      <Layout className="flex-1">
        <TopBar onShowLogin={showLoginModal} />
        <Content className="h-full" style={{ marginTop: '8px' }}>
          <Outlet />
        </Content>
      </Layout>

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
            const session = userSession.getSession();
            if (session) {
              const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.userId)
                .single();

              if (profileError) {
                message.warning(profileError.message);
                return;
              }
              if (!profile) {
                setProfileSheetVisible(true);
              }
            }
          }}
        />
      </Modal>

      {/* 个人资料创建面板 */}
      <UserProfileCreateSheet
        visible={profileSheetVisible}
        onClose={handleProfileSheetClose}
      />
    </Layout>
  );
}
