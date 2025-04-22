import { Menu } from "antd";

import { HomeOutlined, TeamOutlined, SearchOutlined } from "@ant-design/icons";
import { Layout } from "antd";
import { Content } from "antd/es/layout/layout";
import Sider from "antd/es/layout/Sider";
import { Outlet, useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
  
    const menuItems = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: 'Home',
        onClick: () => navigate('/'),
      },
      {
        key: '/following',
        icon: <TeamOutlined />,
        label: 'Following',
        onClick: () => navigate('/following'),
      },
      {
        key: '/find',
        icon: <SearchOutlined />,
        label: 'Find',
        onClick: () => navigate('/find'),
      },
    ];
  
    return (
      <Layout className="h-screen w-screen">
        <Sider className="w-64 h-full" theme="light">
          <Menu
            mode="inline"
            defaultSelectedKeys={['/']}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Content className="h-full flex-1">
          <Outlet />
        </Content>
      </Layout>
    );
  }
  