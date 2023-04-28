import DiscordClient from 'clients/discord';

export async function POST(request: Request) {
  const isVerified = await DiscordClient.verifyInteraction(request);
  if (!isVerified) {
    return new Response('invalid request signature', { status: 404 });
  }
  return new Response(undefined, { status: 204 });
}
