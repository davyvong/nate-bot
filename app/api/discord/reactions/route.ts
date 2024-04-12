import { APIMessage } from 'discord-api-types/v10';
import { NextRequest } from 'next/server';
import DiscordAPI from 'services/discord/api';
import { object, string } from 'yup';

export const POST = async (request: NextRequest) => {
  const body = await request.json();
  const bodySchema = object({
    channelId: string().required(),
    emoji: string().required(),
    messageId: string().required(),
  });
  if (!bodySchema.isValidSync(body)) {
    return new Response(undefined, { status: 400 });
  }
  const response = await DiscordAPI.getChannelMessage(body.channelId, body.messageId);
  const message: APIMessage = await response.json();
  return DiscordAPI.createReaction(message.channel_id, message.id, body.emoji);
};
