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
  eslint: {
    // 빌드 시 ESLint 오류를 경고로 처리하여 빌드가 실패하지 않도록 설정
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
