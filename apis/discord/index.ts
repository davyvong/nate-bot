import { API, InteractionResponseType } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import nacl from 'tweetnacl';

import { DiscordSlashCommands } from './enums';

class DiscordClient {
  private static readonly rest: REST = new REST({
    version: process.env.DISCORD_REST_VERSION,
  }).setToken(process.env.DISCORD_BOT_TOKEN);
  private static readonly api: API = new API(DiscordClient.rest);

  public static getAPI(): API {
    return DiscordClient.api;
  }

  public static async verifyRequest(request: Request): Promise<boolean> {
    const signature = request.headers.get('X-Signature-Ed25519') as string;
    const timestamp = request.headers.get('X-Signature-Timestamp') as string;
    const body = await request.text();
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, 'hex'),
      Buffer.from(process.env.DISCORD_PUBLIC_KEY, 'hex'),
    );
  }

  public static async handleInteraction(interaction: any): Promise<unknown> {
    console.log({
      interaction,
      options: interaction.data.options,
    });
    switch (interaction.data.name) {
      case DiscordSlashCommands.GoodMorning: {
        return {
          data: {
            content: 'Good morning!',
          },
          type: InteractionResponseType.ChannelMessageWithSource,
        };
      }
      default: {
        break;
      }
    }
  }
}

export default DiscordClient;
