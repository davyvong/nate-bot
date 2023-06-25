import {
  APIApplicationCommandInteraction,
  APIChatInputApplicationCommandInteractionData,
  InteractionResponseType,
} from 'discord-api-types/v10';
import { NextResponse } from 'next/server';
import ServerEnvironment from 'server/environment';
import InngestAPI from 'server/inngest/api';
import { InngestEvents } from 'server/inngest/enums';
import Token from 'server/token';

import DiscordAPI from 'server/discord/api';
import { DiscordApplicationCommandNames, DiscordResponses } from './enums';
import OpenWeatherAPI from 'server/openweather/api';

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
      name: InngestEvents.DiscordInteractionGoodMorning,
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
    const location = await OpenWeatherAPI.getLocation(locationOption.value);
    if (!location) {
      return DiscordAPI.createFollowupMessage(interaction.application_id, interaction.token, {
        body: JSON.stringify({ data: { content: DiscordResponses.LocationNotFound } }),
      });
    }
    const url = new URL(ServerEnvironment.getBaseURL() + '/api/weather');
    const token = await Token.sign({ latitude: location.latitude, longitude: location.longitude });
    url.searchParams.set('token', token);
    const response = await fetch(url, {
      body: JSON.stringify(location),
      cache: 'no-store',
      method: 'POST',
    });
    if (!response.ok) {
      return DiscordAPI.createFollowupMessage(interaction.application_id, interaction.token, {
        body: JSON.stringify({ data: { content: DiscordResponses.ForecastNotFound } }),
      });
    }
    const formData = new FormData();
    const payload = {
      data: {
        attachments: [{ filename: interaction.id + '.png', id: 0 }],
        content: DiscordResponses.GoodMorning,
      },
    };
    formData.set('payload_json', JSON.stringify(payload));
    formData.set('files[0]', await response.blob(), interaction.id + '.png');
    return DiscordAPI.createFollowupMessage(interaction.application_id, interaction.token, { body: formData });
  }
}

export default DiscordApplicationCommand;
