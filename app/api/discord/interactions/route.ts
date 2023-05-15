import DiscordInteraction from 'server/discord/interaction';
import { object, string } from 'yup';

export const runtime = 'edge';

export const POST = async (request: Request) => {
  const body = await request.text();
  const headers = {
    signature: request.headers.get('X-Signature-Ed25519'),
    timestamp: request.headers.get('X-Signature-Timestamp'),
  };
  const headersSchema = object({
    signature: string().required().min(1),
    timestamp: string().required().min(1),
  });
  if (!headersSchema.isValidSync(headers)) {
    return new Response(undefined, { status: 401 });
  }
  if (!(await DiscordInteraction.verify(headers.signature, headers.timestamp, body))) {
    return new Response(undefined, { status: 401 });
  }
  const interaction = JSON.parse(body);
  console.log({ interaction });
  return DiscordInteraction.respond(interaction);
};
