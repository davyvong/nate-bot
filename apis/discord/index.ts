import { API, InteractionResponseType } from '@discordjs/core';
import type { APIChatInputApplicationCommandInteraction } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import Environment from 'environment';
import { FormData } from 'formdata-node';
import { FormDataEncoder } from 'form-data-encoder';
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

  public static async handleInteraction(interaction: APIChatInputApplicationCommandInteraction): Promise<Response> {
    console.log({ interaction });
    switch (interaction.data.name) {
      case DiscordSlashCommands.GoodMorning: {
        return DiscordClient.handleGoodMorning(interaction);
      }
      default: {
        return new Response(undefined, { status: 200 });
      }
    }
  }

  private static async handleGoodMorning(interaction: APIChatInputApplicationCommandInteraction): Promise<Response> {
    if (!Array.isArray(interaction.data.options)) {
      return new Response(undefined, { status: 200 });
    }
    const locationOption: any = interaction.data.options.find((option): boolean => option.name === 'location');
    if (!locationOption) {
      return new Response(undefined, { status: 200 });
    }
    const url = new URL(Environment.getBaseURL() + '/api/weather');
    url.searchParams.set('query', locationOption.value);
    const response = await fetch(url);
    const imageBuffer = await response.arrayBuffer();
    const payload = {
      data: {
        attachments: [
          {
            description: locationOption.value,
            filename: interaction.id + '.png',
            id: 0,
          },
        ],
        content: 'Good morning!',
      },
      type: InteractionResponseType.ChannelMessageWithSource,
    };
    const formData = new FormData();
    formData.set('payload_json', JSON.stringify(payload));
    formData.set('files[0]', new Blob([imageBuffer]), interaction.id + '.png');
    const encoder = new FormDataEncoder(formData);
    const readable = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode());
        controller.close();
      }
    })
    return new Response(readable, {
      headers: encoder.headers,
      status: 200,
    });
  }
}

export default DiscordClient;
