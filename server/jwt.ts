import { JWTPayload, SignJWT, jwtVerify } from 'jose';

class JWT {
  public static async sign(payload: object): Promise<string> {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 2592000;

    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setExpirationTime(exp)
      .setIssuedAt(iat)
      .setNotBefore(iat)
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));
  }

  public static async verify(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET));
    return payload;
  }
}

export default JWT;
