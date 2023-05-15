import { NextRequest, NextResponse } from 'next/server';
import CronJobAPI from 'server/cron-job/api';
import DiscordAuthentication from 'server/discord/authentication';

export const runtime = 'edge';

export const GET = async (request: NextRequest) => {
  const token = await DiscordAuthentication.verifyToken(request.cookies);
  if (!token) {
    return new Response(undefined, { status: 401 });
  }
  const list = await CronJobAPI.getCronList();
  return NextResponse.json(list, {
    headers: {
      'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
    },
  });
};
