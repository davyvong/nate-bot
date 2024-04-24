import {
  APIApplicationCommandInteraction,
  APIChatInputApplicationCommandInteractionData,
  InteractionResponseType,
} from 'discord-api-types/v10';
import { NextResponse } from 'next/server';
import { ServerEnvironment } from 'utils/environment';
import Token from 'utils/token';

import DiscordAPI from 'services/discord/api';
import { DiscordApplicationCommandNames, DiscordResponses } from './enums';
import OpenWeatherAPI from 'services/openweather/api';
import QStashClientFactory from 'services/qstash';

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
        return NextResponse.json({ data: { content: DiscordResponses.IDontKnow } });
      }
    }
  }

  private static async executeGoodMorning(interaction: APIApplicationCommandInteraction): Promise<Response> {
    const url = new URL(ServerEnvironment.getBaseURL() + '/api/discord/interactions/goodmorning');
    const token = await Token.sign({ interactionId: interaction.id });
    url.searchParams.set('token', token);
    await QStashClientFactory.getInstance().publishJSON({
      body: interaction,
      url: url.href,
    });
    return NextResponse.json({ type: InteractionResponseType.DeferredChannelMessageWithSource });
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
    const responseBlob = await response.blob();
    if (responseBlob.size === 0) {
      return new Response(undefined, { status: 424 });
    }
    const formData = new FormData();
    const payload = {
      data: {
        attachments: [{ filename: interaction.id + '.png', id: 0 }],
        content: DiscordResponses.GoodMorning,
      },
    };
    formData.set('payload_json', JSON.stringify(payload));
    formData.set('files[0]', responseBlob, interaction.id + '.png');
    return DiscordAPI.createFollowupMessage(interaction.application_id, interaction.token, { body: formData });
  }
}

export default DiscordApplicationCommand;
