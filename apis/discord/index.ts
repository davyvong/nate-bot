import type { RESTGetAPICurrentUserResult, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import Environment from 'utils/environment';

class DiscordAPI {
  public static getOAuth2AuthorizeURL(): URL {
    const url = new URL('https://discord.com/api/oauth2/authorize');
    url.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID);
    url.searchParams.set('redirect_uri', Environment.getBaseURL() + '/api/discord/oauth2/callback');
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'identify');
    return url;
  }

  public static async getOAuth2AccessToken(code: string): Promise<RESTPostOAuth2AccessTokenResult> {
    const response = await fetch('https://discord.com/api/oauth2/token', {
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: Environment.getBaseURL() + '/api/discord/oauth2/callback',
        scope: 'identify',
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.json();
  }

  public static async getCurrentUser(
    oauth2Token: RESTPostOAuth2AccessTokenResult,
  ): Promise<RESTGetAPICurrentUserResult> {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: oauth2Token.token_type + ' ' + oauth2Token.access_token,
      },
    });
    return response.json();
  }
}

export default DiscordAPI;
