import { NextResponse } from 'next/server';
import OpenWeatherAPI from 'server/openweather/api';
import { object, string } from 'yup';

export const runtime = 'edge';

export const GET = async (request: Request) => {
  const requestURL = new URL(request.url);
  const params = {
    query: requestURL.searchParams.get('query'),
  };
  const paramsSchema = object({
    query: string().required().min(1).max(100),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  const locations = await OpenWeatherAPI.getLocations(params.query);
  return NextResponse.json(locations, {
    headers: { 'Cache-Control': 's-maxage=604800, stale-while-revalidate=86400' },
  });
};
