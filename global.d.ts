/* eslint-disable @typescript-eslint/no-unused-vars */

namespace NodeJS {
  interface ProcessEnv {
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    DISCORD_PUBLIC_KEY: string;
    INNGEST_EVENT_KEY: string;
    INNGEST_SIGNING_KEY: string;
    JWT_SECRET: string;
    OPENWEATHER_API_KEY: string;
    TOKEN_SIGNING_KEY: string;
    VERCEL_ENV: string;
    VERCEL_URL: string;
    VERCEL_URL_OVERRIDE: string;
  }
}
