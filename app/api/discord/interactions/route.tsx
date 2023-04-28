import DiscordClient from 'clients/discord';

export const runtime = 'experimental-edge';

export async function POST(request: Request) {
  const isVerified = DiscordClient.verifyInteraction(request);
  if (!isVerified) {
    return new Response('invalid request signature', { status: 404 });
  }
  return new Response(undefined, { status: 204 });
}
