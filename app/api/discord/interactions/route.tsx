import { InteractionResponseType, InteractionType } from '@discordjs/core';
import DiscordClient from 'clients/discord';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  if (!(await DiscordClient.verifyRequest(request.clone()))) {
    return new Response(undefined, { status: 401 });
  }
  const interaction = await request.clone().json();
  console.log(interaction);
  switch (interaction.type) {
    case InteractionType.Ping: {
      return NextResponse.json({ type: InteractionResponseType.Pong }, { status: 200 });
    }
    case InteractionType.ApplicationCommand: {
      return NextResponse.json(
        {
          data: {
            content: 'Hello World!',
          },
          type: InteractionResponseType.ChannelMessageWithSource,
        },
        { status: 200 },
      );
    }
    default:
      return new Response(undefined, { status: 200 });
  }
}
