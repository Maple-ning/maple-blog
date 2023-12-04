import routes from '@/router';
import Error404 from '@/pages/Error404';

/**
 * @description: 扁平化函数
 * @param { Array } arr 需要扁平的数组
 * @return { Array } 扁平化后的数组
 */
export const flattenRoutes = (arr) =>
  arr.reduce((prev, item) => {
    if (Array.isArray(item.children)) {
      prev.push(item)
    }
    return prev.concat(Array.isArray(item.children) ? flattenRoutes(item.children) : item)
  }, [])

export const getKeyName = (pathName = '/404') => {
  const thePath = pathName.split('?')[0]
  const curRoute = flattenRoutes(routes)
    .filter((item) => !item.index)
    .filter((item) => item.key?.indexOf(thePath) !== -1)
  if (!curRoute[0]) {
    return {
      title: 'Not Found',
      tabKey: '/404',
      element: <Error404 />,
    }
  }

  const { name, key, element, index, path, auth } = curRoute[0]
  return { index: index ?? false, path, auth, title: name, tabKey: key, element }
}

// 获取本地存储
export const getLocalStorage = (key) => {
  const value = window.localStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch (error) {
    return value;
  }
}

// 设置本地存储
export const setLocalStorage = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value))
}

// 删除本地存储
export const removeLocalStorage = (key) => {
  window.localStorage.removeItem(key)
}

// 清空本地存储
export const clearLocalStorage = () => {
  window.localStorage.clear()
}