import InngestAPI from 'server/inngest';
import { InngestEvents } from 'server/inngest/enums';
import type {
  APIApplicationCommandInteraction,
  APIChatInputApplicationCommandInteractionData,
} from 'discord-api-types/v10';
import { InteractionResponseType } from 'discord-api-types/v10';
import { FormDataEncoder } from 'form-data-encoder';
import { FormData } from 'formdata-node';
import { NextResponse } from 'next/server';
import ServerEnvironment from 'server/environment';
import Token from 'server/token';

import DiscordAPI from 'server/discord';
import { DiscordApplicationCommandNames, DiscordResponses } from './enums';

declare global {
  interface RequestInit {
    duplex?: string;
  }
}

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
        return DiscordAPI.createFollowupMessage(interaction.application_id, interaction.token, {
          body: JSON.stringify({ data: { content: DiscordResponses.IDontKnow } }),
        });
      }
    }
  }

  private static async followupGoodMorning(interaction: APIApplicationCommandInteraction): Promise<Response> {
    const data = <APIChatInputApplicationCommandInteractionData>interaction.data;
    if (!Array.isArray(data.options)) {
      return DiscordAPI.createFollowupMessage(interaction.application_id, interaction.token, {
        body: JSON.stringify({ data: { content: DiscordResponses.MissingOptions } }),
      });
    }
    const locationOption: any = data.options.find((option): boolean => option.name === 'location');
    if (!locationOption) {
      return DiscordAPI.createFollowupMessage(interaction.application_id, interaction.token, {
        body: JSON.stringify({ data: { content: DiscordResponses.LocationNotFound } }),
      });
    }
    let response;
    try {
      const url = new URL(ServerEnvironment.getBaseURL() + '/api/weather');
      url.searchParams.set('query', locationOption.value);
      url.searchParams.set('token', await Token.sign({ query: locationOption.value }));
      response = await fetch(url);
    } catch {
      return DiscordAPI.createFollowupMessage(interaction.application_id, interaction.token, {
        body: JSON.stringify({ data: { content: DiscordResponses.LocationNotFound } }),
      });
    }
    if (!response) {
      return DiscordAPI.createFollowupMessage(interaction.application_id, interaction.token, {
        body: JSON.stringify({ data: { content: DiscordResponses.LocationNotFound } }),
      });
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
    return DiscordAPI.createFollowupMessage(interaction.application_id, interaction.token, {
      body: stream,
      duplex: 'half',
      headers: { ...encoder.headers },
    });
  }
}

export default DiscordApplicationCommand;
