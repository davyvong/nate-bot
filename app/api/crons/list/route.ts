import { NextRequest, NextResponse } from 'next/server';
import DiscordAuthentication from 'server/discord/authentication';
import PlanetScaleAPI from 'server/planetscale/api';

export const GET = async (request: NextRequest) => {
  const token = await DiscordAuthentication.verifyToken(request.cookies);
  if (!token) {
    return new Response(undefined, { status: 401 });
  }
  const results = await PlanetScaleAPI.getInstance().execute('SHOW TABLES');
  return NextResponse.json(results);
};
