import jwt from 'jsonwebtoken';
import type { JwtPayload, VerifyErrors } from 'jsonwebtoken';

class JWT {
  public static sign(payload: Buffer | object | string): string {
    return jwt.sign(payload, process.env.JWT_SECRET);
  }

  public static verify(token: string): Promise<string | JwtPayload | undefined> {
    return new Promise(resolve => {
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        undefined,
        (error: VerifyErrors | null, decodedToken?: string | JwtPayload) => {
          if (error) {
            resolve(undefined);
          } else {
            resolve(decodedToken);
          }
        },
      );
    });
  }
}

export default JWT;
