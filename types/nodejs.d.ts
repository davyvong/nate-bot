/* eslint-disable @typescript-eslint/no-unused-vars */

namespace NodeJS {
  interface ProcessEnv {
    DISCORD_BOT_TOKEN: string;
    DISCORD_CHANNEL_ID: string;
    DISCORD_CLIENT_ID: string;
    DISCORD_CLIENT_SECRET: string;
    DISCORD_CRON_TOKEN: string;
    DISCORD_PUBLIC_KEY: string;
    JWT_SECRET: string;
    MONGODB_URI: string;
    NEXT_PUBLIC_VERCEL_ENV: string;
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: string;
    OPENWEATHER_API_KEY: string;
    QSTASH_TOKEN: string;
    TOKEN_SIGNING_KEY: string;
    VERCEL_ENV: string;
    VERCEL_URL: string;
    VERCEL_URL_OVERRIDE: string;
  }
}
