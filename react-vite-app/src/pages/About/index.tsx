import React from "react";
import "./index.scss";
import { loadImage } from "@/utils/image";
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import GitHubIcon from "@/assets/icon/githubIcon";
import GiteeIcon from "@/assets/icon/giteeIcon";
import BlibliIcon from "@/assets/icon/blibliIcon";
import JuejinIcon from "@/assets/icon/JuejinIcon";


const onChange = (key: string) => {
  console.log(key);
};

const items: TabsProps['items'] = [
  {
    key: '1',
    label: '动态',
  },
  {
    key: '2',
    label: '文章',
  }
];

const About: React.FC = () => {
  return <div className="root">
    <div className="about-card card-shadow">
      <div className="profile-wrapper">
        <div className="profile-box">
          <img src={loadImage("avatar.png")} alt="" />
        </div>
        <div className="info-box">
          <div className="info-username">Maple-Ning</div>
          <div className="info-hobby">游戏、前端</div>
          <div className="info-intro">想努力学习的人</div>
          <div className="info-social-platform">
            <a href="https://github.com/Maple-ning" target="_blank" rel="noreferrer">
              <GitHubIcon />
            </a>
            <a href="https://gitee.com/ning19990806" target="_blank" rel="noreferrer">
              <GiteeIcon />
            </a>
            <a href="https://space.bilibili.com/387909807" target="_blank" rel="noreferrer">
              <BlibliIcon />
            </a>
            <a href="https://juejin.cn/user/1139535180732413" target="_blank" rel="noreferrer">
              <JuejinIcon />
            </a>
          </div>
        </div>
      </div >
      <div className="detail-wrapper">
        <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
      </div>
    </div >
  </div >;
};

export default About;
