import { Client, GatewayDispatchEvents, GatewayIntentBits } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import { Response, fetch } from 'undici';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN as string);

const gateway = new WebSocketManager({
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
  token: process.env.DISCORD_BOT_TOKEN as string,
});

const client = new Client({ rest, gateway });

const createReaction = async (channelId: string, messageId: string, emoji: string): Promise<Response> => {
  return fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, {
    method: 'PUT',
    headers: {
      Authorization: 'Bot ' + process.env.DISCORD_BOT_TOKEN,
    },
  });
};

client.on(GatewayDispatchEvents.MessageCreate, async ({ data }) => {
  try {
    if (data.mentions.some(mention => mention.id === process.env.DISCORD_BOT_ID)) {
      console.log(data);
      await createReaction(data.channel_id, data.id, 'bulba:715627372191285328');
      await createReaction(data.channel_id, data.id, 'WeatherMan:1117920707469398158');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
    }
  }
});

gateway.connect();
