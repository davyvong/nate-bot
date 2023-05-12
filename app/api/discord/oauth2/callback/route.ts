import DiscordAPI from 'server/discord';
import { serialize } from 'cookie';
import { NextResponse } from 'next/server';
import ServerEnvironment from 'server/environment';
import JWT from 'server/jwt';
import { object, string } from 'yup';

export const runtime = 'edge';

export const GET = async (request: Request) => {
  const requestURL = new URL(request.url);
  const params = {
    code: requestURL.searchParams.get('code'),
  };
  const paramsSchema = object({
    code: string().required().length(30),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  const oauth2Token = await DiscordAPI.getOAuth2AccessToken(params.code);
  const user = await DiscordAPI.getCurrentUser(oauth2Token);
  const token = await JWT.sign(user);
  return NextResponse.redirect(ServerEnvironment.getBaseURL(), {
    headers: {
      'Set-Cookie': serialize('token', token, { maxAge: 2592000, path: '/' }),
    },
  });
};
