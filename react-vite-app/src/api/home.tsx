import request from "@/utils/request";

export const getHomeRecommend= () => {
  return request({
    method: "get",
    url: "/home-recommend",
  })
}

export const getHomeList = () => {
  return request({
    method: "get",
    url: "/home-list",
  })
}