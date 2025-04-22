import { Menu, Modal, Button } from "antd";
import { useState } from "react";
import {
  HomeOutlined,
  TeamOutlined,
  SearchOutlined,
  UserOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { Outlet, useNavigate } from "react-router-dom";
import LoginSheet from "./pages/login/LoginSheet";

export default function Root() {
  const navigate = useNavigate();
  const [loginModalVisible, setLoginModalVisible] = useState(false);

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Home",
      onClick: () => navigate("/"),
    },
    {
      key: "/following",
      icon: <TeamOutlined />,
      label: "Following",
      onClick: () => navigate("/following"),
    },
    {
      key: "/find",
      icon: <SearchOutlined />,
      label: "Find",
      onClick: () => navigate("/find"),
    },
  ];

  const showLoginModal = () => {
    setLoginModalVisible(true);
  };

  const handleLoginCancel = () => {
    setLoginModalVisible(false);
  };

  return (
    <Layout className="h-screen w-screen">
      <Sider className="w-64 h-full" theme="light">
        <div className="flex justify-center my-4">
          <Button
            type="primary"
            icon={<UserOutlined />}
            onClick={showLoginModal}
          >
            登录
          </Button>
        </div>
        <Menu
          mode="inline"
          defaultSelectedKeys={["/"]}
          style={{ height: "calc(100% - 60px)", borderRight: 0 }}
          items={menuItems}
        />
      </Sider>
      <Content className="h-full flex-1">
        <Outlet />
      </Content>

      <Modal
        open={loginModalVisible}
        onCancel={handleLoginCancel}
        footer={null}
        styles={{
          content: {
            padding: 0,
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
    </Layout>
  );
}
