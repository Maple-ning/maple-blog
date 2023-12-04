import React, { useEffect } from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(()=>{
    setTimeout(() => {
      navigate("/home");
    }, 1000);
  },[]);
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Result
        status="404"
        title="页面不存在"
        subTitle="对不起，此页面不存在.即将返回首页..."
      />
    </div>
  );
};

export default NotFoundPage;
