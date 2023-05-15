import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DiscordAPI from 'server/discord/api';
import JWT from 'server/jwt';

import type { DiscordToken } from './types';

class DiscordAuthentication {
  public static async verifyToken(): Promise<DiscordToken | never> {
    const tokenCookie = cookies().get('token');
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
