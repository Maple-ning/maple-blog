import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import Header from "../Header";
const { Content } = Layout;
import "@/assets/styles/layout.scss";

const LayoutMain: React.FC = () => {
  return (
    <Layout className="layout-container">
      <Header />
      <Content className="layout-content-main" id="layout-content">
        <Outlet />
      </Content>
      <div className="bg"></div>
    </Layout>
  );
}

export default LayoutMain;
