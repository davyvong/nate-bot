class ServerEnvironment {
  public static readonly isDevelopment = process.env.VERCEL_ENV === 'development';
  public static readonly isPreview = process.env.VERCEL_ENV === 'preview';
  public static readonly isProduction = process.env.VERCEL_ENV === 'production';

  public static getBaseURL(): string {
    if (process.env.VERCEL_URL_OVERRIDE) {
      return process.env.VERCEL_URL_OVERRIDE;
    }
    if (ServerEnvironment.isDevelopment) {
      return 'http://' + process.env.VERCEL_URL;
    }
    return 'https://' + process.env.VERCEL_URL;
  }
}

export default ServerEnvironment;
