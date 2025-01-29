import { AxiosInstance } from "axios";
import { logger } from "./logger";

export const configureLoggingInterceptors = (
  client: AxiosInstance,
  name: string,
) => {
  client.interceptors.request.use((config) => {
    logger.logHttpRequest(
      config.method || "GET",
      `${name}:${config.url}`,
      config.data,
    );
    return config;
  });

  client.interceptors.response.use(
    (response) => {
      const bytes = new Blob([JSON.stringify(response.data)]).size;
      logger.logHttpResponse(
        `${name}:${response.config.url}`,
        response.status,
        response.data,
        bytes,
      );
      return response;
    },
    (error) => {
      logger.logHttpResponse(
        `${name}:${error.config.url}`,
        error.response?.status || 0,
        error.response?.data || error.message,
      );
      return Promise.reject(error);
    },
  );
};
