// 动态加载assets目录下的图片资源
export const loadImage = (name:string) => {
  return new URL(`../assets/image/${name}`, import.meta.url).href;
}