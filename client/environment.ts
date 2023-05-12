class ClientEnvironment {
  public static readonly isDevelopment = process.env.NEXT_PUBLIC_VERCEL_ENV === 'development';
  public static readonly isPreview = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview';
  public static readonly isProduction = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';

  public static getCommitId(): string {
    if (ClientEnvironment.isDevelopment) {
      return 'develop';
    }
    return process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA.substring(0, 7);
  }
}

export default ClientEnvironment;
