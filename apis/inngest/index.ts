import DiscordApplicationCommand from 'discord/commands';
import { Inngest } from 'inngest';
import pkg from 'package.json';

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
          name: pkg.name + '/' + InngestEvents.DiscordGoodMorning,
          retries: 1,
        },
        { event: InngestEvents.DiscordGoodMorning },
        async ({ event }) => {
          await DiscordApplicationCommand.followup(event.data.interaction);
        },
      ),
    ];
  }
}

export default InngestAPI;
