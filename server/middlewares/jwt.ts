import type { NextRequest } from 'next/server';
import JWT from 'server/utils/jwt';
import type { Token } from 'server/utils/jwt';

export const config = {
  matcher: '/about/:path*',
};

export interface NextRequestWithToken extends NextRequest {
  token?: Token;
}

const applyToken =
  (next: any) =>
  async (request: NextRequestWithToken): Promise<Response | undefined> => {
    try {
      const tokenCookie = request.cookies.get('token');
      if (!tokenCookie) {
        return new Response(undefined, { status: 401 });
      }
      const decodedToken = await JWT.verify(tokenCookie.value);
      if (!decodedToken) {
        return new Response(undefined, { status: 401 });
      }
      request.token = decodedToken;
      return next(request);
    } catch {
      return new Response(undefined, { status: 401 });
    }
  };

export default applyToken;
