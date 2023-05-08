import { InteractionResponseType, InteractionType } from '@discordjs/core';
import DiscordAPI from 'server/apis/discord';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!(await DiscordAPI.verifyRequest(request.clone()))) {
    return new Response(undefined, { status: 401 });
  }
  const interaction = await request.clone().json();
  console.log({ interaction });
  switch (interaction.type) {
    case InteractionType.Ping: {
      return NextResponse.json({ type: InteractionResponseType.Pong }, { status: 200 });
    }
    case InteractionType.ApplicationCommand: {
      return DiscordAPI.handleApplicationCommand(interaction);
    }
    default: {
      return new Response(undefined, { status: 200 });
    }
  }
}
