import { API, InteractionResponseType } from '@discordjs/core';
import type { APIChatInputApplicationCommandInteraction } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import Environment from 'environment';
import { FormDataEncoder } from 'form-data-encoder';
import { FormData } from 'formdata-node';
import { NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import TokenUtility from 'utils/token';

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
        return NextResponse.json(
          {
            data: {
              content: 'The command is not valid.',
            },
          },
          { status: 200 },
        );
      }
    }
  }

  private static async handleGoodMorning(interaction: APIChatInputApplicationCommandInteraction): Promise<Response> {
    if (!Array.isArray(interaction.data.options)) {
      return NextResponse.json(
        {
          data: {
            content: 'The command is missing options.',
          },
        },
        { status: 200 },
      );
    }
    const locationOption = interaction.data.options.find((option): boolean => option.name === 'location');
    if (!locationOption) {
      return NextResponse.json(
        {
          data: {
            content: 'The location could not be found.',
          },
        },
        { status: 200 },
      );
    }
    DiscordClient.handleGoodMorningFollowup(interaction, locationOption);
    return NextResponse.json(
      {
        type: InteractionResponseType.DeferredChannelMessageWithSource,
      },
      { status: 200 },
    );
  }

  private static async handleGoodMorningFollowup(
    interaction: APIChatInputApplicationCommandInteraction,
    locationOption: any,
  ): Promise<Response> {
    const url = new URL(Environment.getBaseURL() + '/api/weather');
    url.searchParams.set('query', locationOption.value);
    url.searchParams.set('token', await TokenUtility.sign({ query: locationOption.value }));
    const imageResponse = await fetch(url);
    const imageBlob = await imageResponse.blob();
    const formData = new FormData();
    formData.set(
      'payload_json',
      JSON.stringify({
        data: {
          attachments: [
            {
              filename: interaction.id + '.png',
              id: 0,
            },
          ],
          content: 'Good morning!',
        },
        type: InteractionResponseType.ChannelMessageWithSource,
      }),
    );
    formData.set('files[0]', imageBlob, interaction.id + '.png');
    const encoder = new FormDataEncoder(formData);
    const iterator = encoder.encode();
    const stream = new ReadableStream({
      async pull(controller) {
        const { value, done } = await iterator.next();
        if (done) {
          return controller.close();
        }
        controller.enqueue(value);
      },
    });
    return fetch(`/webhooks/${interaction.application_id}/${interaction.token}`, {
      body: stream,
      headers: encoder.headers,
    });
  }
}

export default DiscordClient;
