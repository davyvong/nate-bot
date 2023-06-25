import { Inngest } from 'inngest';
import pkg from 'package.json';
import DiscordAPI from 'server/discord/api';
import DiscordApplicationCommand from 'server/discord/command';
import { DiscordResponses } from 'server/discord/enums';
import ServerEnvironment from 'server/environment';
import Token from 'server/token';

import { InngestEvents } from './enums';

class InngestAPI {
  private static readonly instance = new Inngest({
    eventKey: process.env.INNGEST_EVENT_KEY,
    name: pkg.name,
  });

  public static getInstance(): Inngest {
    return InngestAPI.instance;
  }

  public static createFunctions() {
    return [
      InngestAPI.getInstance().createFunction(
        {
          name: pkg.name + '/' + InngestEvents.DiscordGoodMorningInteraction,
          retries: 1,
        },
        { event: InngestEvents.DiscordGoodMorningInteraction },
        async ({ event }) => {
          await DiscordApplicationCommand.followup(event.data.interaction);
        },
      ),
      InngestAPI.getInstance().createFunction(
        {
          name: pkg.name + '/' + InngestEvents.DiscordGoodMorningCron,
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
            formData.set('payload_json', JSON.stringify({ content: DiscordResponses.GoodMorning }));
            await DiscordAPI.createChannelMessage(process.env.DISCORD_CHANNEL_ID, { body: formData });
          }
          const sleep = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));
          const sentEventPromises: Promise<void>[] = [];
          let i = 0;
          for (const location of locations) {
            if (i % 3 === 0) {
              await sleep(1500);
            }
            sentEventPromises.push(
              InngestAPI.getInstance().send({
                data: { location },
                name: InngestEvents.DiscordGoodMorningCronEvent,
              }),
            );
            i++;
          }
          await Promise.allSettled(sentEventPromises);
        },
      ),
      InngestAPI.getInstance().createFunction(
        {
          name: pkg.name + '/' + InngestEvents.DiscordGoodMorningCronEvent,
          retries: 1,
        },
        { event: InngestEvents.DiscordGoodMorningCronEvent },
        async ({ event }) => {
          const url = new URL(ServerEnvironment.getBaseURL() + '/api/crons/goodmorning');
          const token = await Token.sign({
            latitude: event.data.location.latitude,
            longitude: event.data.location.longitude,
          });
          url.searchParams.set('token', token);
          await fetch(url, {
            body: JSON.stringify(event.data.location),
            cache: 'no-store',
            method: 'POST',
          });
        },
      ),
    ];
  }
}

export default InngestAPI;
