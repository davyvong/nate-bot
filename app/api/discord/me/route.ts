import { NextResponse } from 'next/server';
import applyToken from 'server/middlewares/jwt';
import type { NextRequestWithToken } from 'server/middlewares/jwt';

export const GET = applyToken(async (request: NextRequestWithToken) => NextResponse.json(request.token));
