import type { NextRequest } from 'next/server';
import JWT from 'server/jwt';

export const runtime = 'edge';

export const GET = async (request: NextRequest) => {
  try {
    const tokenCookie = request.cookies.get('token');
    if (!tokenCookie) {
      return new Response(undefined, { status: 401 });
    }
    const decodedToken = await JWT.verify(tokenCookie.value);
    if (!decodedToken) {
      return new Response(undefined, { status: 401 });
    }
    return decodedToken;
  } catch {
    return new Response(undefined, { status: 401 });
  }
};
