import type { APIChatInputApplicationCommandInteraction } from '@discordjs/core';
import { API, InteractionResponseType } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import InngestAPI from 'apis/inngest';
import { InngestEvents } from 'apis/inngest/enums';
import Environment from 'environment';
import { FormDataEncoder } from 'form-data-encoder';
import { FormData } from 'formdata-node';
import { NextResponse } from 'next/server';
import nacl from 'tweetnacl';
import TokenUtility from 'utils/token';

import { DiscordSlashCommands } from './enums';

declare global {
  interface RequestInit {
    duplex?: string;
  }
}

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

  public static async handleApplicationCommand(
    interaction: APIChatInputApplicationCommandInteraction,
  ): Promise<Response> {
    switch (interaction.data.name) {
      case DiscordSlashCommands.GoodMorning: {
        return DiscordClient.handleGoodMorning(interaction);
      }
      default: {
        return NextResponse.json({ data: { content: 'The command is not valid.' } }, { status: 200 });
      }
    }
  }

  private static async handleGoodMorning(interaction: APIChatInputApplicationCommandInteraction): Promise<Response> {
    if (!Array.isArray(interaction.data.options)) {
      return NextResponse.json({ data: { content: 'The command is missing options.' } }, { status: 200 });
    }
    const locationOption: any = interaction.data.options.find((option): boolean => option.name === 'location');
    if (!locationOption) {
      return NextResponse.json({ data: { content: 'The location could not be found.' } }, { status: 200 });
    }
    await InngestAPI.getInstance().send({
      data: {
        applicationId: interaction.application_id,
        interactionId: interaction.id,
        location: locationOption.value,
        token: interaction.token,
      },
      name: InngestEvents.DiscordGoodMorning,
    });
    return NextResponse.json({ type: InteractionResponseType.DeferredChannelMessageWithSource }, { status: 200 });
  }

  public static async handleGoodMorningFollowup(params: GoodMorningFollowupParams): Promise<Response> {
    console.log({ params });
    const { applicationId, interactionId, location, token } = params;
    const url = new URL(Environment.getBaseURL() + '/api/weather');
    url.searchParams.set('query', location);
    url.searchParams.set('token', await TokenUtility.sign({ query: location }));
    const response = await fetch(url);
    const formData = new FormData();
    formData.set(
      'payload_json',
      JSON.stringify({
        data: {
          attachments: [{ filename: interactionId + '.png', id: 0 }],
          content: 'Good morning!',
        },
      }),
    );
    formData.set('files[0]', await response.blob(), interactionId + '.png');
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
    return fetch('https://discord.com/api/v10/webhooks/' + applicationId + '/' + token, {
      body: stream,
      duplex: 'half',
      headers: encoder.headers,
      method: 'POST',
    });
  }
}

export default DiscordClient;
