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
    const image = await response.arrayBuffer();
    // https://www.reddit.com/r/Discord_Bots/comments/u4p6ic/file_upload_from_serverless_aws_lambda_bot/
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
    const body = `--boundary
Content-Disposition: form-data; name="payload_json"
Content-Type: application/json

${JSON.stringify(payload)}
--boundary
Content-Disposition: form-data; name="files[0]"; filename="${interaction.id}.png"
Content-Type: image/png

${image}
--boundary--`;
    console.log({ body });
    return new Response(body, {
      headers: {
        'Content-Type': 'multipart/form-data; boundary=boundary',
      },
      status: 200,
    });
  }
}

export default DiscordClient;
