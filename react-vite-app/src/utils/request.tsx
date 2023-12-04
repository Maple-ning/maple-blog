import axios, { AxiosRequestConfig } from "axios";
import { message } from "antd";

const http = axios.create({
  baseURL: "http://106.15.248.240/api/",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 3000,
  withCredentials: false, // 跨域时候允许携带凭证
});

// 请求拦截器
http.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    config.headers!.token = token; //非空断言!
    return config;
  },
  (error) => {
    message.error("配置错误");
    return Promise.reject(error);
  }
);

// 响应拦截器
http.interceptors.response.use(
  (response: any) => {
    return response.data;
  },
  (error) => {
    // 处理响应错误
    if (error.response) {
      // 存在响应错误，根据状态码进行处理
      if (error.response.status === 408) {
        // 请求超时
        // 进行相应的处理，如显示错误提示、重新发送请求等
        message.error("请求超时");
      } else {
        // 其他错误状态码
        // 进行相应的处理，如显示错误提示、跳转页面等
        message.error("请求错误");
      }
    } else if (error.request) {
      // 请求未收到响应，可能是网络错误或服务器未响应等
      // 进行相应的处理，如显示网络错误提示、重试操作等
      message.error("服务器连接失败，请重试！");
    } else {
      // 其他错误
      // 进行相应的处理，如显示错误提示、跳转页面等
      message.error("请求错误");
    }
    return Promise.reject(error);
  }
);

export default function request(config: AxiosRequestConfig) {
  const { method = "get", url = "", data = {} } = config;

  switch (method.toUpperCase()) {
    case "GET":
      return http.get(url, { params: data });
    case "POST":
      return http.post(url, data);
    default:
      return http(config); //其他参数 PUT,DEL
  }
}
