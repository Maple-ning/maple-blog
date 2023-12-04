import React from "react";
import { Breadcrumb } from 'antd';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import routes from '@/router';
import { getRouteLabelMap } from '@/utils/route';

const BreadcrumbView: React.FC = () => {
  const location = useLocation();
  const pathSnippets = location.pathname.split('/').filter((i) => i);
  // 存放路由和标题对应信息
  const [breadcrumbNameMap, setBreadcrumbNameMap] = useState([]);

  useEffect(() => {
    setBreadcrumbNameMap(getRouteLabelMap(routes))
  }, [])

  return (
    <div className="breadcrumb">
      <Breadcrumb>
        {pathSnippets.map((item) => (
          <Breadcrumb.Item key={item} href={item}>
            {breadcrumbNameMap[item]}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </div>
  )
}

export default BreadcrumbView;