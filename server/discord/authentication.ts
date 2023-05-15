import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { redirect } from 'next/navigation';
import DiscordAPI from 'server/discord/api';
import JWT from 'server/jwt';

import type { DiscordToken } from './types';

class DiscordAuthentication {
  public static async verifyToken(cookies: RequestCookies): Promise<DiscordToken | undefined> {
    const tokenCookie = cookies.get('token');
    if (!tokenCookie) {
      return undefined;
    }
    try {
      const payload = await JWT.verify(tokenCookie.value);
      return payload as DiscordToken;
    } catch {
      return undefined;
    }
  }

  public static async verifyTokenOrRedirect(cookies: ReadonlyRequestCookies): Promise<DiscordToken | never> {
    const tokenCookie = cookies.get('token');
    if (!tokenCookie) {
      return redirect(DiscordAPI.getOAuth2AuthorizeURL().href);
    }
    try {
      const payload = await JWT.verify(tokenCookie.value);
      return payload as DiscordToken;
    } catch {
      return redirect(DiscordAPI.getOAuth2AuthorizeURL().href);
    }
  }
}

export default DiscordAuthentication;
