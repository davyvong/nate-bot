import MDBUser, { MDBUserPermission } from 'models/user';
import { RequestCookies } from 'next/dist/compiled/@edge-runtime/cookies';
import { ReadonlyRequestCookies } from 'next/dist/server/web/spec-extension/adapters/request-cookies';
import { redirect } from 'next/navigation';
import DiscordAPI from 'services/discord/api';
import MongoDBClientFactory from 'services/mongodb';
import JWT from 'utils/jwt';

import { DiscordToken } from './types';

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

  public static async getPermissions(discordId: string): Promise<MDBUserPermission[]> {
    try {
      const db = await MongoDBClientFactory.getInstance();
      const userDoc = await db.collection('users').findOne({ discordId });
      if (!userDoc) {
        return [];
      }
      const user = MDBUser.fromDocument(userDoc);
      return user.permissions;
    } catch (error: unknown) {
      return [];
    }
  }
}

export default DiscordAuthentication;
