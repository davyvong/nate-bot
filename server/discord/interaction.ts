import {
  APIApplicationCommandInteraction,
  APIInteraction,
  InteractionResponseType,
  InteractionType,
} from 'discord-api-types/v10';
import { NextResponse } from 'next/server';
import nacl from 'tweetnacl';

import DiscordApplicationCommand from './command';
import { DiscordResponses } from './enums';

class DiscordInteraction {
  public static async verify(signature: string, timestamp: string, body: string): Promise<boolean> {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex'),
    );
  }

  public static async respond(interaction: APIInteraction): Promise<Response> {
    switch (interaction.type) {
      case InteractionType.Ping: {
        return DiscordInteraction.createPingResponse();
      }
      case InteractionType.ApplicationCommand: {
        return DiscordInteraction.createApplicationCommandResponse(interaction);
      }
      default: {
        return DiscordInteraction.createUnknownResponse();
      }
    }
  }

  private static createPingResponse(): Response {
    return NextResponse.json({ type: InteractionResponseType.Pong });
  }

  private static async createApplicationCommandResponse(
    interaction: APIApplicationCommandInteraction,
  ): Promise<Response> {
    return DiscordApplicationCommand.execute(interaction);
  }

  private static createUnknownResponse(): Response {
    return NextResponse.json({ data: { content: DiscordResponses.IDontKnow } });
  }
}

export default DiscordInteraction;
