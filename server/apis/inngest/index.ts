import DiscordClient from 'server/apis/discord';
import { Inngest } from 'inngest';
import pkg from 'package.json';

import { InngestEvents } from './enums';

class InngestAPI {
  private static readonly instance = new Inngest({ name: pkg.name });

  public static getInstance(): Inngest {
    return InngestAPI.instance;
  }

  public static createFunctions() {
    return [
      InngestAPI.getInstance().createFunction(
        { name: pkg.name + '/goodmorning' },
        { event: InngestEvents.DiscordGoodMorning },
        ({ event }) => DiscordClient.handleGoodMorningFollowup(event.data.interaction, event.data.location),
      ),
    ];
  }
}

export default InngestAPI;
