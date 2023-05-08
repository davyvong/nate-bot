import jwt from 'jsonwebtoken';
import type { JwtPayload, VerifyErrors } from 'jsonwebtoken';

export interface Token extends DiscordUser, JwtPayload {
  iat: number;
}

class JWT {
  public static sign(payload: Buffer | object | string): string {
    return jwt.sign(payload, process.env.JWT_SECRET);
  }

  public static verify(token: string): Promise<Token | undefined> {
    return new Promise(resolve => {
      jwt.verify(
        token,
        process.env.JWT_SECRET,
        undefined,
        (error: VerifyErrors | null, decodedToken?: string | JwtPayload) => {
          if (error) {
            resolve(undefined);
          } else {
            resolve(decodedToken as Token);
          }
        },
      );
    });
  }
}

export default JWT;
