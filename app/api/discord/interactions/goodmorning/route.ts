import { APIApplicationCommandInteraction } from 'discord-api-types/v10';
import DiscordApplicationCommand from 'services/discord/command';
import Token from 'utils/token';
import { object, string } from 'yup';

export const runtime = 'edge';

export const POST = async (request: Request): Promise<Response> => {
  const body: APIApplicationCommandInteraction = await request.json();
  console.log({ body });
  const bodySchema = object({
    id: string(),
  });
  if (!bodySchema.isValidSync(body)) {
    return new Response(undefined, { status: 400 });
  }
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
  if (!(await Token.verify(params.token, { interactionId: body.id }))) {
    return new Response(undefined, { status: 401 });
  }
  return DiscordApplicationCommand.followup(body);
};
