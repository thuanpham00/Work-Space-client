import type { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import axios from "axios";
import { message } from "antd";
import { config } from "./config";
import { clearLS, getAccessTokenFromLS, setAccessTokenToLS } from "./auth";
import type { AuthResponse, MessageResponse, SuccessResponse } from "../types/utils.type";
import { isAxiosExpiredTokenError, isError401 } from "./error";
import { useUserStore } from "../store/userStore";

class Http {
  instance: AxiosInstance;
  public accessToken: string;
  private refreshTokenRequest: Promise<string> | null;

  constructor() {
    this.accessToken = getAccessTokenFromLS();
    this.refreshTokenRequest = null;
    this.instance = axios.create({
      baseURL: config.baseURLServer, // kết nối tới server
      timeout: 10000, // thời gian chờ server
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    this.instance.interceptors.request.use(
      (config) => {
        if (config.headers && this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
          // config > headers > Authorization
          return config;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );
    this.instance.interceptors.response.use(
      (response) => {
        if (response.config.url === "/users/login") {
          const data = response.data as AuthResponse;
          this.accessToken = data.data.access_token;
        }
        if (response.config.url === "/users/logout") {
          this.accessToken = "";
        }
        return response;
      },
      (error) => {
        if (isError401(error)) {
          const config = error.response?.config || ({ headers: {} } as InternalAxiosRequestConfig);
          const { url } = config;

          if (
            isAxiosExpiredTokenError<MessageResponse>(error, "AccessToken đã hết hạn!") &&
            url !== "/users/refresh-token"
          ) {
            this.refreshTokenRequest = this.refreshTokenRequest
              ? this.refreshTokenRequest
              : this.handleRefreshToken();

            // nếu không return � đây nó sẽ chạy xuống bên dưới
            return this.refreshTokenRequest.then((accessToken) => {
              if (error.response?.config.headers) {
                return this.instance({
                  ...config,
                  headers: { ...config.headers, Authorization: `Bearer ${accessToken}` },
                });
              }
            });
          }

          if (isAxiosExpiredTokenError<MessageResponse>(error, "RefreshToken đã hết hạn!")) {
            // nếu refresh-token hết hạn thì nó clearLS
            this.accessToken = "";
            clearLS();
            message.error("Phiên làm việc hết hạn");
          }
        }
        message.error(error.response?.data?.message || "Đã có lỗi xảy ra");
        return Promise.reject(error);
      },
    );
  }

  setToken(token: string) {
    this.accessToken = token;
  }

  private handleRefreshToken() {
    return this.instance
      .post<SuccessResponse<{ access_token: string }>>("/users/refresh-token")
      .then((res) => {
        const { access_token } = res.data.data;
        this.accessToken = access_token;
        this.refreshTokenRequest = null;
        setAccessTokenToLS(access_token);
        useUserStore.getState().setAccessToken(access_token);
        return access_token;
      })
      .catch((err) => {
        clearLS();
        this.accessToken = "";
        this.refreshTokenRequest = null;
        useUserStore.getState().setAccessToken(null);
        throw err;
      });
  }
}

// SINGLE INSTANCE — chia sẻ giữa httpRaw và Http
const httpInstance = new Http();

export const httpRaw = httpInstance;
export default httpInstance.instance;
