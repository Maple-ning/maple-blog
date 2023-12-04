import request from "@/utils/request";

export const getArticleDetail= () => {
  return request({
    method: "get",
    url: "/article",
  })
}