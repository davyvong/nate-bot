import type { APIApplicationCommandInteraction, APIInteraction } from 'discord-api-types/v10';
import { InteractionResponseType, InteractionType } from 'discord-api-types/v10';
import { NextResponse } from 'next/server';
import nacl from 'tweetnacl';

import DiscordApplicationCommand from './commands';
import { DiscordResponses } from './enums';

declare global {
  interface RequestInit {
    duplex?: string;
  }
}

class DiscordInteraction {
  public static async verify(request: Request): Promise<boolean> {
    const signature = request.headers.get('X-Signature-Ed25519');
    const timestamp = request.headers.get('X-Signature-Timestamp');
    if (!signature || !timestamp) {
      return false;
    }
    const body = await request.text();
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
    return NextResponse.json({ type: InteractionResponseType.Pong }, { status: 200 });
  }

  private static async createApplicationCommandResponse(
    interaction: APIApplicationCommandInteraction,
  ): Promise<Response> {
    return DiscordApplicationCommand.execute(interaction);
  }

  private static createUnknownResponse(): Response {
    return NextResponse.json({ data: { content: DiscordResponses.IDontKnow } }, { status: 200 });
  }
}

export default DiscordInteraction;
