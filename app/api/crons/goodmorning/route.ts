import DiscordAPI from 'server/discord/api';
import ServerEnvironment from 'server/environment';
import Token from 'server/token';
import { object, string } from 'yup';

export const GET = async (request: Request) => {
  const requestURL = new URL(request.url);
  const params = {
    query: requestURL.searchParams.get('query'),
    token: requestURL.searchParams.get('token'),
  };
  const paramsSchema = object({
    query: string().required().min(1).max(100),
    token: string().required().length(64),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  if (!(await Token.verify(params.token, { query: params.query }))) {
    return new Response(undefined, { status: 401 });
  }
  const url = new URL(ServerEnvironment.getBaseURL() + '/api/weather');
  url.searchParams.set('query', params.query);
  url.searchParams.set('token', await Token.sign({ query: params.query }));
  const response = await fetch(url);
  const formData = new FormData();
  const filename = new Date().getTime().toString() + '.png';
  const payload = { attachments: [{ filename, id: 0 }] };
  formData.set('payload_json', JSON.stringify(payload));
  formData.set('files[0]', await response.blob(), filename);
  return DiscordAPI.createChannelMessage(process.env.DISCORD_CHANNEL_ID, { body: formData });
};
