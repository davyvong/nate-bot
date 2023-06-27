import { Client, GatewayDispatchEvents, GatewayIntentBits } from '@discordjs/core';
import { REST } from '@discordjs/rest';
import { WebSocketManager } from '@discordjs/ws';
import { fetch } from 'undici';

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN as string);

const gateway = new WebSocketManager({
  intents: GatewayIntentBits.GuildMessages | GatewayIntentBits.MessageContent,
  rest,
  token: process.env.DISCORD_BOT_TOKEN as string,
});

const client = new Client({ rest, gateway });

client.on(GatewayDispatchEvents.MessageCreate, async ({ data }) => {
  try {
    if (data.mentions.some(mention => mention.id === process.env.DISCORD_BOT_ID)) {
      console.log(data);
      const channelId = data.channel_id;
      const messageId = data.id;
      const emoji = 'WeatherMan:1117920707469398158';
      await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, {
        method: 'PUT',
        headers: {
          Authorization: 'Bot ' + process.env.DISCORD_BOT_TOKEN,
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
