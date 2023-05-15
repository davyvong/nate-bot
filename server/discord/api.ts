import type { RESTGetAPICurrentUserResult, RESTPostOAuth2AccessTokenResult } from 'discord-api-types/v10';
import ServerEnvironment from 'server/environment';

class DiscordAPI {
  private static getRedirectURI(): string {
    return ServerEnvironment.getBaseURL() + '/api/discord/oauth2/callback';
  }

  public static getOAuth2AuthorizeURL(): URL {
    const url = new URL('https://discord.com/api/oauth2/authorize');
    url.searchParams.set('client_id', process.env.DISCORD_CLIENT_ID);
    url.searchParams.set('redirect_uri', DiscordAPI.getRedirectURI());
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
        redirect_uri: DiscordAPI.getRedirectURI(),
        scope: 'identify',
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.json();
  }

  public static async getCurrentUser(token: RESTPostOAuth2AccessTokenResult): Promise<RESTGetAPICurrentUserResult> {
    const response = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: token.token_type + ' ' + token.access_token,
      },
    });
    return response.json();
  }

  public static getUserAvatarURL(id: string, avatar: string | null): URL {
    if (!avatar) {
      return new URL('https://discord.com/assets/3c6ccb83716d1e4fb91d3082f6b21d77.png');
    }
    return new URL('https://cdn.discordapp.com/avatars/' + id + '/' + avatar + '.png');
  }

  public static async createFollowupMessage(
    applicationId: string,
    token: string,
    options: RequestInit = {},
  ): Promise<Response> {
    return fetch('https://discord.com/api/v10/webhooks/' + applicationId + '/' + token, {
      ...options,
      method: 'POST',
    });
  }

  public static async createChannelMessage(channelId: string, options: RequestInit = {}): Promise<Response> {
    return fetch('https://discord.com/api/v10/channels/' + channelId + '/messages', {
      ...options,
      headers: {
        Authorization: 'Bot ' + process.env.DISCORD_BOT_TOKEN,
      },
      method: 'POST',
    });
  }
}

export default DiscordAPI;
