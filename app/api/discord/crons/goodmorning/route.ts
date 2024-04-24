import { PublishToUrlResponse } from '@upstash/qstash/.';
import DiscordAPI from 'services/discord/api';
import { DiscordResponses } from 'services/discord/enums';
import QStashClientFactory from 'services/qstash';
import { ServerEnvironment } from 'utils/environment';
import Token from 'utils/token';
import { object, string } from 'yup';

export const runtime = 'edge';

export const POST = async (request: Request): Promise<Response> => {
  const requestURL = new URL(request.url);
  const params = {
    token: requestURL.searchParams.get('token'),
  };
  console.log({ params });
  const paramsSchema = object({
    token: string().required().length(64),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  if (!(await Token.verify(params.token, { token: process.env.DISCORD_CRON_TOKEN }))) {
    return new Response(undefined, { status: 401 });
  }
  const url = new URL(ServerEnvironment.getBaseURL() + '/api/locations');
  const response = await fetch(url, { cache: 'no-store' });
  const locations = await response.json();
  if (locations.length > 0) {
    const formData = new FormData();
    formData.set('payload_json', JSON.stringify({ content: DiscordResponses.GoodMorningTeam }));
    await DiscordAPI.createChannelMessage(process.env.DISCORD_CHANNEL_ID, { body: formData });
  }
  const publishPromises: Promise<PublishToUrlResponse>[] = [];
  for (const location of locations) {
    const url = new URL(ServerEnvironment.getBaseURL() + '/api/discord/messages/goodmorning');
    publishPromises.push(
      QStashClientFactory.getInstance().publishJSON({
        body: location,
        url: url.href,
      }),
    );
  }
  await Promise.allSettled(publishPromises);
  return new Response(null, { status: 202 });
};
