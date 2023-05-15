import { NextResponse } from 'next/server';
import CronJobAPI from 'server/cron-job';

export const runtime = 'edge';

export const GET = async () => {
  const list = await CronJobAPI.getCronList();
  return NextResponse.json(list, {
    headers: {
      'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=600',
    },
  });
};
