import { API, InteractionResponseType } from '@discordjs/core';
import type { APIChatInputApplicationCommandInteraction } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import Environment from 'environment';
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

  public static async handleInteraction(interaction: APIChatInputApplicationCommandInteraction): Promise<unknown> {
    console.log({
      interaction,
      options: interaction.data.options,
    });
    switch (interaction.data.name) {
      case DiscordSlashCommands.GoodMorning: {
        if (!Array.isArray(interaction.data.options)) {
          return;
        }
        const locationOption: any = interaction.data.options.find((option): boolean => option.name === 'location');
        if (!locationOption) {
          return;
        }
        const imageURL = new URL(Environment.getBaseURL() + '/api/weather');
        imageURL.searchParams.set('query', locationOption.value);
        return {
          data: {
            content: imageURL,
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
