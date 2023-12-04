import { Suspense, lazy } from 'react';
import Loading from '@/components/Loading'

// 懒加载组件
const lazyLoad = (Component) => (
  <Suspense fallback={<Loading />}>
    <Component />
  </Suspense>
)

// 路由组件引入
const Layout = lazy(() => import('@/layout/Main'));
const Home = lazy(() => import('@/pages/Home'));
const Article = lazy(() => import('@/pages/Article'));
const ArticleDetail = lazy(() => import('@/pages/Article/Detail'));
const About = lazy(() => import('@/pages/About'));
const Error404 = lazy(() => import('@/pages/Error404'));


const rootRouter = [
  {
    path: '/',
    name: '首页',
    key: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        name: "首页",
        key: "home",
        path: "home",
        element: lazyLoad(Home),
      },
      {
        name: '笔记',
        key: 'article',
        path: 'article',
        element: lazyLoad(Article),
      },
      {
        key: 'nodeDetail',
        path: "article/:id",
        element: lazyLoad(ArticleDetail),
      },
      {
        name: '关于我',
        key: 'about',
        path: 'about',
        element: lazyLoad(About)
      },
    ],
  },
  {
    path: '*',
    name: 'No Match',
    key: '*',
    element: lazyLoad(Error404),
  },
]

export default rootRouter