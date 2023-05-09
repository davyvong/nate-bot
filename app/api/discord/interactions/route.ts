import { InteractionType } from 'discord-api-types/v10';
import DiscordInteractions from 'interactions';

export const runtime = 'edge';

export const POST = async (request: Request) => {
  if (!(await DiscordInteractions.verifyRequest(request.clone()))) {
    return new Response(undefined, { status: 401 });
  }
  const interaction = await request.clone().json();
  console.log({ interaction });
  switch (interaction.type) {
    case InteractionType.Ping: {
      return DiscordInteractions.handlePing();
    }
    case InteractionType.ApplicationCommand: {
      return DiscordInteractions.handleApplicationCommand(interaction);
    }
    default: {
      return DiscordInteractions.handleUnknownInteraction();
    }
  }
};
