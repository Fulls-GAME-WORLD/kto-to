export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.86:8889/api/v1/main/poster/backend/service',
  HELLO_ENDPOINTS: {
    HELLO: "/",
  },
  AUTH_ENDPOINTS: {
    REGISTER: "/start/register",
    LOGIN: "/start/login",
    MY_PROFILE: "/get/my/profile",
  },
  POSTER_ENDPOINTS: {
    CREATE: "/create/poster",
    LIST: "/get/posters",
    GET: "/get/poster",
    UPDATE: "/update/poster",
    DELETE: "/delete/poster",
  },
  ASSET_ENDPOINTS: {
    UPLOAD: "/upload/asset",
    LIST: "/get/assets",
    DELETE: "/delete/asset",
  },
  TEMPLATE_ENDPOINTS: {
    LIST: "/get/templates",
    CLONE: "/clone/template",
  },
}