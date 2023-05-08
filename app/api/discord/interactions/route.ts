import { InteractionResponseType, InteractionType } from '@discordjs/core';
import DiscordClient from 'server/apis/discord';
import { NextResponse } from 'next/server';

export const POST = async (request: Request) => {
  if (!(await DiscordClient.verifyRequest(request.clone()))) {
    return new Response(undefined, { status: 401 });
  }
  const interaction = await request.clone().json();
  console.log({ interaction });
  switch (interaction.type) {
    case InteractionType.Ping: {
      return NextResponse.json({ type: InteractionResponseType.Pong }, { status: 200 });
    }
    case InteractionType.ApplicationCommand: {
      return DiscordClient.handleApplicationCommand(interaction);
    }
    default: {
      return new Response(undefined, { status: 200 });
    }
  }
};
