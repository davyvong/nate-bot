import DiscordAPI from 'server/discord/api';
import ServerEnvironment from 'server/environment';
import Token from 'server/token';
import { number, object, string } from 'yup';

export const POST = async (request: Request) => {
  const body: OpenWeatherLocation = await request.json();
  const bodySchema = object({
    city: string().required(),
    country: string().required(),
    latitude: number().required(),
    longitude: number().required(),
    state: string(),
  });
  if (!bodySchema.isValidSync(body)) {
    return new Response(undefined, { status: 400 });
  }
  const requestURL = new URL(request.url);
  const params = {
    token: requestURL.searchParams.get('token'),
  };
  const paramsSchema = object({
    token: string().required().length(64),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  if (!(await Token.verify(params.token, { latitude: body.latitude, longitude: body.longitude }))) {
    return new Response(undefined, { status: 401 });
  }
  const url = new URL(ServerEnvironment.getBaseURL() + '/api/weather');
  url.searchParams.set('token', params.token);
  const response = await fetch(url, {
    body: JSON.stringify(body),
    cache: 'no-store',
    method: 'POST',
  });
  const formData = new FormData();
  const filename = new Date().getTime().toString() + '.png';
  const payload = { attachments: [{ filename, id: 0 }] };
  formData.set('payload_json', JSON.stringify(payload));
  formData.set('files[0]', await response.blob(), filename);
  return DiscordAPI.createChannelMessage(process.env.DISCORD_CHANNEL_ID, { body: formData });
};
