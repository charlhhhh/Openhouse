import { Modal, Button } from "antd";
import { useState, useEffect } from "react";
import { UserOutlined, CloseOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import { Outlet, useNavigate } from "react-router-dom";
import LoginSheet from "./pages/login/LoginSheet";
import { UserProfileCreateSheet } from "./pages/profile/UserProfileCreateSheet";
import { userSession } from "./utils/UserSession";
import CustomSider from "./components/CustomSider";
import TopBar from './components/TopBar';

const SHEET_WIDTH = 840;

export default function Root() {
  const navigate = useNavigate();
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [profileSheetVisible, setProfileSheetVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 监听登录状态变化
  useEffect(() => {
    const handleLoginStateChange = () => {
      const session = userSession.getSession();
      setIsLoggedIn(!!session);

      // 如果用户已登录但没有个人资料，显示资料创建面板
      if (session && !session.profile) {
        setProfileSheetVisible(true);
      }
    };

    // 初始化时检查登录状态
    handleLoginStateChange();

    // 添加登录状态变化监听
    userSession.addListener(handleLoginStateChange);

    // 清理监听器
    return () => {
      userSession.removeListener(handleLoginStateChange);
    };
  }, []);

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
        <TopBar />
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
          onLoginSuccess={() => {
            setLoginModalVisible(false);
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
