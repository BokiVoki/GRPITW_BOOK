import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    SPREADSHEET_ID: process.env.SPREADSHEET_ID,
    SHEET_RANGE: process.env.SHEET_RANGE,
    SECRET_NAME: process.env.SECRET_NAME,
  },
  serverRuntimeConfig: {
    // 서버 측에서만 사용할 설정
    GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
  },
};

export default nextConfig;
