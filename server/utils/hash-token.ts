class HashToken {
  private static readonly signingKey = crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(process.env.TOKEN_SIGNING_KEY),
    { name: 'HMAC', hash: { name: 'SHA-256' } },
    false,
    ['sign'],
  );

  private static toHex(arrayBuffer: ArrayBuffer): string {
    return Array.prototype.map.call(new Uint8Array(arrayBuffer), n => n.toString(16).padStart(2, '0')).join('');
  }

  public static async sign(payload: any): Promise<string> {
    const signature = await crypto.subtle.sign(
      'HMAC',
      await HashToken.signingKey,
      new TextEncoder().encode(JSON.stringify(payload)),
    );
    return HashToken.toHex(signature);
  }

  public static async verify(token: string, payload: any): Promise<boolean> {
    const signedToken = await HashToken.sign(payload);
    return token === signedToken;
  }
}

export default HashToken;
