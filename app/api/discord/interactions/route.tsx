import DiscordClient from 'clients/discord';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!(await DiscordClient.verifyInteraction(request.clone()))) {
    return new Response(undefined, { status: 401 });
  }
  const body = await request.clone().json();
  console.log(body);
  if (body.type === 1) {
    return NextResponse.json({ type: 1 }, { status: 200 });
  }
  return new Response(undefined, { status: 200 });
}
