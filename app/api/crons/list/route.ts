import { NextResponse } from 'next/server';
import PlanetScaleAPI from 'server/planetscale/api';

export const GET = async () => {
  const results = await PlanetScaleAPI.getInstance().execute('SHOW TABLES');
  return NextResponse.json(results);
};
