
import React from "react";

import { Layout, Typography, Dropdown, Button } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import AppIcon from "../../icons/AppIcon";
import "antd/dist/reset.css";
import "./header.css";

const { Header: AntHeader } = Layout;
const { Title } = Typography;


const Header = ({ user, isAuthenticated, onLogout }) => {
  const menu = {
    items: [
      {
        key: 'profile',
        label: (
          <div className="dropdown-profile-menu">
            <div className="dropdown-profile-name">
              {user?.first_name} {user?.last_name}
            </div>
            <Button 
              type="text" 
              icon={<LogoutOutlined style={{ fontSize: '16px' }} />}
              onClick={onLogout}
              className="dropdown-logout-btn"
            >
              Выйти
            </Button>
          </div>
        ),
      }
    ],
  };

  return (
    <AntHeader className="main-header">
      <Title className="main-header-title">
        <AppIcon className="main-header-app-icon"/>
        Вести
      </Title>
      {isAuthenticated && user && (
        <Dropdown 
          menu={menu} 
          trigger={["click"]} 
          placement="bottomRight"
          overlayClassName="dropdown-custom-menu"
        >
          <span className="main-header-user">
            <UserOutlined />
          </span>
        </Dropdown>
      )}
    </AntHeader>
  );
}

export default Header;