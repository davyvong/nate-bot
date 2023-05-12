import DiscordInteraction from 'server/discord/interaction';

// https://github.com/vercel/next.js/issues/46337
// export const runtime = 'edge';

export const POST = async (request: Request) => {
  if (!(await DiscordInteraction.verify(request.clone()))) {
    return new Response(undefined, { status: 401 });
  }
  const interaction = await request.clone().json();
  console.log({ interaction });
  return DiscordInteraction.respond(interaction);
};
