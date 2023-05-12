class ServerEnvironment {
  public static readonly isDevelopment = process.env.VERCEL_ENV === 'development';
  public static readonly isPreview = process.env.VERCEL_ENV === 'preview';
  public static readonly isProduction = process.env.VERCEL_ENV === 'production';

  public static getBaseURL(): string {
    const url = process.env.VERCEL_URL_OVERRIDE || process.env.VERCEL_URL;
    if (ServerEnvironment.isDevelopment) {
      return 'http://' + url;
    }
    return 'https://' + url;
  }
}

export default ServerEnvironment;
