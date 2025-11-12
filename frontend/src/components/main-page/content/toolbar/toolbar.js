import React from "react";
import { Button, Tooltip, Dropdown, Space } from "antd";
import { ReloadOutlined, PlusOutlined, OrderedListOutlined } from "@ant-design/icons";
import "./toolbar.css";

const Toolbar = ({ onReload, onCreate, sortMenu }) => (
  <div className="main-toolbar">
    <Space style={{ width: "100%", justifyContent: "space-between" }}>
      <div style={{ display: "flex", flexDirection: "row", gap: "8px"}}>
        <Tooltip title="Обновить">
          <Button icon={<ReloadOutlined />} onClick={onReload} />
        </Tooltip>
        <Dropdown menu={sortMenu} placement="rightBottom" trigger={["click"]} overlayClassName="dropdown-custom-menu">
          <Button icon={<OrderedListOutlined />} />
        </Dropdown>
      </div>
      
      <Button type="primary" icon={<PlusOutlined />} onClick={onCreate}>
        Создать пост
      </Button>
      
    </Space>
  </div>
);

export default Toolbar;
