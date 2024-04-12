import { ClientOptions, Inngest } from 'inngest';
import pkg from 'package.json';
import DiscordAPI from 'services/discord/api';
import DiscordApplicationCommand from 'services/discord/command';
import { DiscordResponses } from 'services/discord/enums';
import { ServerEnvironment } from 'utils/environment';
import Token from 'utils/token';

import { InngestEvents } from './enums';

class InngestAPI {
  private static readonly instance: Inngest<ClientOptions> = new Inngest({
    eventKey: process.env.INNGEST_EVENT_KEY,
    name: pkg.name,
  } as ClientOptions);

  public static getInstance(): Inngest<ClientOptions> {
    return InngestAPI.instance;
  }

  public static createFunctions() {
    return [
      InngestAPI.getInstance().createFunction(
        { name: InngestEvents.DiscordInteractionGoodMorning },
        { event: InngestEvents.DiscordInteractionGoodMorning },
        async ({ event }) => {
          const response = await DiscordApplicationCommand.followup(event.data.interaction);
          if (response.status === 429) {
            throw new Error(response.statusText);
          }
          return {
            status: response.status,
            statusText: response.statusText,
          };
        },
      ),
      InngestAPI.getInstance().createFunction(
        {
          name: InngestEvents.DiscordCronGoodMorning,
          retries: 1,
        },
        {
          cron: 'TZ=America/Toronto 0 7 * * *',
        },
        async () => {
          const url = new URL(ServerEnvironment.getBaseURL() + '/api/locations');
          const response = await fetch(url, { cache: 'no-store' });
          const locations = await response.json();
          if (locations.length > 0) {
            const formData = new FormData();
            formData.set('payload_json', JSON.stringify({ content: DiscordResponses.GoodMorningTeam }));
            await DiscordAPI.createChannelMessage(process.env.DISCORD_CHANNEL_ID, { body: formData });
          }
          const sentEventPromises: Promise<void>[] = [];
          for (const location of locations) {
            sentEventPromises.push(
              InngestAPI.getInstance().send({
                data: { location },
                name: InngestEvents.DiscordMessageGoodMorning,
              }),
            );
          }
          await Promise.allSettled(sentEventPromises);
        },
      ),
      InngestAPI.getInstance().createFunction(
        {
          name: InngestEvents.DiscordMessageGoodMorning,
          retries: 5,
        },
        { event: InngestEvents.DiscordMessageGoodMorning },
        async ({ event }) => {
          const url = new URL(ServerEnvironment.getBaseURL() + '/api/crons/goodmorning');
          const token = await Token.sign({
            latitude: event.data.location.latitude,
            longitude: event.data.location.longitude,
          });
          url.searchParams.set('token', token);
          const response = await fetch(url, {
            body: JSON.stringify(event.data.location),
            cache: 'no-store',
            method: 'POST',
          });
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return {
            status: response.status,
            statusText: response.statusText,
          };
        },
      ),
    ];
  }
}

export default InngestAPI;
