import DiscordClient from 'apis/discord';
import { object, string } from 'yup';

export async function GET(request: Request) {
  const requestURL = new URL(request.url);
  const params = {
    applicationId: requestURL.searchParams.get('applicationId'),
    interactionId: requestURL.searchParams.get('interactionId'),
    location: requestURL.searchParams.get('location'),
    token: requestURL.searchParams.get('token'),
  };
  const paramsSchema = object({
    applicationId: string().required().length(19),
    interactionId: string().required().length(19),
    location: string().required().min(1).max(100),
    token: string().required().min(200).max(300),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  return DiscordClient.handleGoodMorningFollowup(params);
}
