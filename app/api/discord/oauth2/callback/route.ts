import { serialize } from 'cookie';
import Environment from 'environment';
import { NextResponse } from 'next/server';
import DiscordClient from 'server/apis/discord';
import JWT from 'server/utils/jwt';
import { object, string } from 'yup';

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
  const oauth2Token = await DiscordClient.getOAuth2AccessToken(params.code);
  const user = await DiscordClient.getCurrentUser(oauth2Token);
  console.log({ user });
  const token = JWT.sign(user);
  return NextResponse.redirect(Environment.getBaseURL(), {
    headers: {
      'Set-Cookie': serialize('token', token, { maxAge: 2592000, path: '/' }),
    },
  });
};
