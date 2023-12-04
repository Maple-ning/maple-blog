import React, { useState, useEffect } from "react";
import "./index.scss";
import ReactMarkdown from 'react-markdown';
import gfm from "remark-gfm";
import 'markdown-navbar/dist/navbar.css';
import { getArticleDetail } from "@/api/article";
import "@/assets/styles/markdown.scss";

type Title = {
  key: string;
  href: number;
  title: string;
  offsetTop: number;
  children?: Title[];
  nodeName: any;
};

const ArticleDetail: React.FC = () => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [type, setType] = useState("");
  const [content, setContent] = useState("");
  const [catalog, setCatalog] = useState<Title[]>([]);
  const [show, setShow] = useState(false);
  const [active, setActive] = useState<string>("0");

  const handleScroll = () => {
    const scroll = document.getElementById("layout-content"); //滚动条滚动高度
    const scrollTop = scroll.scrollTop + 80;
    const offsetHeight = scroll.offsetHeight;
    const scrollHeight = scroll.scrollHeight;

    if (!scrollTop) {
      return;
    }
    for (let i = 0; i < catalog.length - 1; i++) {
      const offsetBefore = catalog[i].offsetTop;
      const offsetAfter = catalog[i + 1].offsetTop;
      if (scrollTop >= offsetBefore && scrollTop < offsetAfter) {
        if (scrollTop + offsetHeight >= scrollHeight) {
          setActive(catalog[catalog.length - 1].key);
        } else {
          setActive(catalog[i].key);
        }
        break;
      }
    }
  };

  useEffect(() => {
    getArticleDetail().then((res) => {
      if (res.code === 200) {
        setTitle(res.data.title);
        setTime(res.data.time);
        setType(res.data.type);
        setContent(res.data.content);
      }
    })
  }, [])

  useEffect(() => {
    setCatalog(addAnchor());
    setShow(true);
  }, [content, setContent]);

  useEffect(() => {
    const layoutContent = document.getElementById("layout-content");
    if (layoutContent) {
      layoutContent.addEventListener("scroll", handleScroll);

      return () => {
        layoutContent.removeEventListener("scroll", handleScroll);
      };
    }
  }, [catalog, setCatalog])

  const formatNavItem = (headerDom: NodeListOf<HTMLElement>) => {
    // 将NodeList转换为数组，并提取出需要的属性
    const headerArr = Array.prototype.slice
      .call(headerDom)
      .map((item, index) => {
        const title = {
          href: index,
          key: "" + index,
          title: headerDom[index].innerText,
          offsetTop: item.offsetTop,
          children: [],
          nodeName: item.nodeName,
        };
        return title;
      }) as Title[];

    /**
     * (双重循环，从后往前，逐渐将子节点存入父节点children属性)
     * 1. 从后往前，将子标题直接存入前一个父级标题的children[]中
     * 2. 如果前一个标题与当前标题(或标题数组)无直系关系，则直接将当前标题(或标题数组解构后)放入list数组
     * 3. 循环多次，直到result数组长度无变化，结束循环
     */
    let result = headerArr;
    let preLength = 0;
    let newLength = result.length;
    let num = 0;
    while (preLength !== newLength) {
      num++;
      preLength = result.length; // 获取处理前result数组长度
      const list: Title[] = []; // list数组用于存储本次for循环结果
      let childList: Title[] = []; // childList存储遍历到的兄弟标题，用于找到父标题时赋值给父标题的children属性
      for (let index = result.length - 1; index >= 0; index--) {
        if (
          // 当前节点与上一个节点是兄弟节点，将该节点存入childList数组
          result[index - 1] &&
          result[index - 1].nodeName.charAt(1) ===
          result[index].nodeName.charAt(1)
        ) {
          childList.unshift(result[index]);
        } else if (
          // 当前节点是上一个节点的子节点，则将该节点存入childList数组，将childList数组赋值给上一节点的children属性，childList数组清空
          result[index - 1] &&
          result[index - 1].nodeName.charAt(1) <
          result[index].nodeName.charAt(1)
        ) {
          childList.unshift(result[index]);
          result[index - 1].children = [
            ...(result[index - 1].children as []),
            ...childList,
          ];
          childList = [];
        } else {
          // 当前节点与上一个节点无直系关系，或当前节点下标为0的情况
          childList.unshift(result[index]);
          if (childList.length > 0) {
            list.unshift(...childList);
          } else {
            list.unshift(result[index]);
          }
          childList = [];
        }
      }
      result = list;
      newLength = result.length; // 获取处理后result数组长度
    }
    return result;
  };

  const addAnchor = () => {
    // 获取markdown标题的dom节点
    const header: NodeListOf<HTMLElement> = document.querySelectorAll(
      "h1, h2, h3, h4, h5, h6"
    );
    // 向标题中注入id，用于锚点跳转
    header.forEach((navItem, index) => {
      navItem.setAttribute("id", index.toString());
    });
    // 格式化标题数组，用于antd锚点组件自动生成锚点
    const titles = formatNavItem(header);
    return titles;
  };

  const handleClickNavItem = (e: any, link: any) => {
    e.preventDefault();
    console.log(link)
    if (typeof link.href !== "undefined") {
      setActive(link.key);
      // 找到锚点对应得的节点
      const element = document.getElementById(link.href);
      
      // 如果对应id的锚点存在，就跳滚动到锚点顶部
      element &&
        element.scrollIntoView({ block: "start", behavior: "smooth" });
    }
  };

  const isInViewPort = (element) => {
    // 获取可视窗口的高度。
    const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    // 获取滚动条滚动的高度
    const scrollTop = document.documentElement.scrollTop;
    // 获取元素偏移的高度。就是距离可视窗口的偏移量。
    const offsetTop = element.offsetTop;
    return offsetTop - scrollTop <= screenHeight;
  }


  return (
    <div className="root">
      <div className="article-detail-view">
        <div className="article-content card-shadow">
          <div className="article-title">{title}</div>
          <div className="auth-info">
            <span style={{ marginRight: "20px" }}>发布时间：{time}</span>
            <span>文章类别：{type}</span>
          </div>
          <div className="article-markdown">
            {
              show && <ReactMarkdown
                remarkPlugins={[gfm]}
                children={content}
              />
            }
          </div>
        </div>
        <div className="article-catalogue card-shadow">
          <div className="catalog-title">目录</div>
          <div className="catalog-body">
            <ul>
              {
                catalog.map((item) => {
                  return <li key={item.href} className={active === item.key ? "active-bar" : "catalog-bar"} onClick={(event) => handleClickNavItem(event, item)}>{item.title}</li>
                })
              }
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
