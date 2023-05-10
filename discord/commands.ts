import InngestAPI from 'apis/inngest';
import { InngestEvents } from 'apis/inngest/enums';
import type {
  APIApplicationCommandInteraction,
  APIChatInputApplicationCommandInteractionData,
} from 'discord-api-types/v10';
import { InteractionResponseType } from 'discord-api-types/v10';
import { FormDataEncoder } from 'form-data-encoder';
import { FormData } from 'formdata-node';
import { NextResponse } from 'next/server';
import Environment from 'utils/environment';
import Token from 'utils/token';

import { DiscordApplicationCommandNames, DiscordResponses } from './enums';

class DiscordApplicationCommand {
  public static async execute(interaction: APIApplicationCommandInteraction): Promise<Response> {
    switch (interaction.data.name) {
      case DiscordApplicationCommandNames.GoodMorning: {
        return DiscordApplicationCommand.executeGoodMorning(interaction);
      }
      default: {
        return NextResponse.json({ data: { content: DiscordResponses.IDontKnow } }, { status: 200 });
      }
    }
  }

  private static async executeGoodMorning(interaction: APIApplicationCommandInteraction): Promise<Response> {
    await InngestAPI.getInstance().send({
      data: { interaction },
      name: InngestEvents.DiscordGoodMorning,
    });
    return NextResponse.json({ type: InteractionResponseType.DeferredChannelMessageWithSource }, { status: 200 });
  }

  public static async followup(interaction: APIApplicationCommandInteraction): Promise<Response> {
    switch (interaction.data.name) {
      case DiscordApplicationCommandNames.GoodMorning: {
        return DiscordApplicationCommand.followupGoodMorning(interaction);
      }
      default: {
        return NextResponse.json({ data: { content: DiscordResponses.IDontKnow } }, { status: 200 });
      }
    }
  }

  private static async followupGoodMorning(interaction: APIApplicationCommandInteraction): Promise<Response> {
    const data = <APIChatInputApplicationCommandInteractionData>interaction.data;
    if (!Array.isArray(data.options)) {
      return NextResponse.json({ data: { content: DiscordResponses.MissingOptions } }, { status: 200 });
    }
    const locationOption: any = data.options.find((option): boolean => option.name === 'location');
    if (!locationOption) {
      return NextResponse.json({ data: { content: DiscordResponses.LocationNotFound } }, { status: 200 });
    }
    let response;
    try {
      const url = new URL(Environment.getBaseURL() + '/api/weather');
      url.searchParams.set('query', locationOption.value);
      url.searchParams.set('token', await Token.sign({ query: location }));
      response = await fetch(url);
    } catch {
      return NextResponse.json({ data: { content: DiscordResponses.LocationNotFound } }, { status: 200 });
    }
    if (!response) {
      return NextResponse.json({ data: { content: DiscordResponses.LocationNotFound } }, { status: 200 });
    }
    const formData = new FormData();
    formData.set(
      'payload_json',
      JSON.stringify({
        data: {
          attachments: [{ filename: interaction.id + '.png', id: 0 }],
          content: DiscordResponses.GoodMorning,
        },
      }),
    );
    formData.set('files[0]', await response.blob(), interaction.id + '.png');
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
    return fetch('https://discord.com/api/v10/webhooks/' + interaction.application_id + '/' + interaction.token, {
      body: stream,
      duplex: 'half',
      headers: { ...encoder.headers },
      method: 'POST',
    });
  }
}

export default DiscordApplicationCommand;
