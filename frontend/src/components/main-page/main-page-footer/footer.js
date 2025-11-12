import React from "react";
import { Layout } from "antd";
import "antd/dist/reset.css";
import "./footer.css";

const { Footer: AntFooter } = Layout;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <AntFooter className="main-footer">
      © {currentYear} Вести. Все права защищены.
    </AntFooter>
  );
}

export default Footer;