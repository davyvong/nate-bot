import { InteractionResponseType, InteractionType } from '@discordjs/core';
import DiscordAPI from 'apis/discord';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!(await DiscordAPI.verifyRequest(request.clone()))) {
    return new Response(undefined, { status: 401 });
  }
  const interaction = await request.clone().json();
  switch (interaction.type) {
    case InteractionType.Ping: {
      return NextResponse.json({ type: InteractionResponseType.Pong }, { status: 200 });
    }
    case InteractionType.ApplicationCommand: {
      const response = await DiscordAPI.handleInteraction(interaction);
      return NextResponse.json(response, { status: 200 });
    }
    default:
      return new Response(undefined, { status: 200 });
  }
}
