interface DiscordOAuth2Token {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
}

interface DiscordUser {
  accent_color: number;
  avatar: string;
  banner: string;
  discriminator: string;
  email: string;
  flags: number;
  id: string;
  premium_type: number;
  public_flags: number;
  username: string;
  verified: boolean;
}

interface GoodMorningFollowupParams {
  applicationId: string;
  interactionId: string;
  location: string;
  token: string;
}
