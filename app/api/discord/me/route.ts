import { NextResponse } from 'next/server';
import applyJWT from 'middlewares/jwt';
import type { NextRequestWithToken } from 'middlewares/jwt';

export const runtime = 'edge';

export const GET = applyJWT(async (request: NextRequestWithToken) => NextResponse.json(request.token));
