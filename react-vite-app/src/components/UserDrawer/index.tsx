import React, { useState } from 'react';
import { Avatar, Drawer } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { removeLocalStorage } from "@/utils/publicFn";
import { loadImage } from "@/utils/image";
import "./index.scss";

const UserDrawer: React.FC = (props) => {
  const navigate = useNavigate();
  const [user] = useState("Maple-Ning");
  const onClose = () => {
    props.setOpen(false);
  };
  const toAbout = () => {
    navigate("/about");
    onClose();
  }
  const toGitHub = () => {
    window.location.href = "https://github.com/Maple-ning";
  };
  const toGitee = () => {
    window.location.href = "https://gitee.com/ning19990806";
  };
  const signOut = () => {
    removeLocalStorage("learn-token");
    removeLocalStorage("selectKey");
    navigate("/login");
  };

  return (
    <>
      <Drawer bodyStyle={{ padding: "8px" }} placement="right" closable={false} onClose={onClose} open={props.open}>
        <div className="user-container">
          <div className="user-title">
            <span>
              <Avatar style={{ backgroundColor: "#7265e6", marginRight: "8px", verticalAlign: 'middle' }} size="middle" src={loadImage("avatar.png")}>
                {user}
              </Avatar>
              Maple-Ning
            </span>
            <CloseOutlined onClick={onClose} />
          </div>
          <ul className="user-body">
            <li className="user-li" onClick={toAbout}>主页</li>
            <li className="bottom-line"></li>
            <li className="user-li">设置</li>
            <li className="user-li">笔记</li>
            <li className="bottom-line"></li>
            <li className="user-li" onClick={toGitHub}>GitHub</li>
            <li className="user-li" onClick={toGitee}>Gitee</li>
            <li className="bottom-line"></li>
            <li className="user-li" onClick={signOut}>退出</li>
          </ul>
        </div>
      </Drawer>
    </>
  );
};

export default UserDrawer;