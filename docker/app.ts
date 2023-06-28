import { Client, GatewayDispatchEvents, GatewayIntentBits } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import { fetch } from 'undici';

const token = process.env.DISCORD_BOT_TOKEN as string;

const rest = new REST({ version: '10' }).setToken(token);

const gateway = new WebSocketManager({
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
  token,
});

const client = new Client({ rest, gateway });

const userMentionsForReaction = new Set(process.env.DISCORD_BOT_ID.split(','));

client.on(GatewayDispatchEvents.MessageCreate, async ({ data }) => {
  try {
    if (data.mentions.some(mention => userMentionsForReaction.has(mention.id))) {
      console.log(data);
      const channelId = data.channel_id;
      const messageId = data.id;
      const emoji = 'WeatherMan:1117920707469398158';
      await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, {
        method: 'PUT',
        headers: {
          Authorization: 'Bot ' + token,
        },
      });
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
});

gateway.connect();
