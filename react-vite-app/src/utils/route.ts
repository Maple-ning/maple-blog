export interface MetaProp {
  title: string;
  key: string;
  noAuth: boolean;
}
export interface RouteObject {
  children?: RouteObject[];
  element?: React.ReactNode;
  path?: string;
  meta?: Partial<MetaProp>
}

/**
* 获取路径对应的路由配置，没有则返回null
* @param path 路由完整路径
* @param routes 路由数组
* @returns 路由配置项
*/
export function matchRoute(path: string, routes: RouteObject[] = []): any {
  const pathArr = path.split("/");
  pathArr.shift();
  const curPath = pathArr.shift();
  let result: any = null;
  for (let i = 0; i < routes.length; i++) {
      const item = routes[i];
      if ([curPath, `/${curPath}`].includes(item.path)) {
          if (!pathArr.length) {
              return item;
          }
          if (item.children) {
              const res = matchRoute(`/${pathArr.join("/")}`, item.children);
              if (res) {
                  return res;
              }
          }
      }
  }
  return result;
}


export const getRouteLabelMap = (routes) => {
  //首先进行深拷贝
  const list = JSON.parse(JSON.stringify(routes))
  const newObj = {}
  const recursion = (list) => {
      //先遍历数组
      list.forEach(item => {
          //遍历数组项的对象
          for (const key in item) {
              //将需要的值添加到新对象中
              if (key === "key") newObj[item.key] = item.name
              //如果有子项,需要用到递归
              if (key === 'children') recursion(item[key])
          }
      });
  }
  //调用一下递归函数
  recursion(list)
  //返回新数组
  return newObj
}