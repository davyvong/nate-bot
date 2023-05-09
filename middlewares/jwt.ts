import type { JwtPayload } from 'jsonwebtoken';
import type { NextRequest } from 'next/server';
import JWT from 'utils/jwt';

export interface NextRequestWithToken extends NextRequest {
  token?: JwtPayload;
}

const applyJWT =
  (next: any) =>
  async (request: NextRequestWithToken): Promise<Response | undefined> => {
    try {
      const tokenCookie = request.cookies.get('token');
      if (!tokenCookie) {
        return new Response(undefined, { status: 401 });
      }
      const decodedToken = await JWT.verify(tokenCookie.value);
      if (!decodedToken || typeof decodedToken === 'string') {
        return new Response(undefined, { status: 401 });
      }
      request.token = decodedToken;
      return next(request);
    } catch {
      return new Response(undefined, { status: 401 });
    }
  };

export default applyJWT;
