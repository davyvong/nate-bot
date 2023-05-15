import { FormDataEncoder } from 'form-data-encoder';
import { FormData } from 'formdata-node';
import { NextResponse } from 'next/server';
import DiscordAPI from 'server/discord/api';
import { DiscordResponses } from 'server/discord/enums';
import ServerEnvironment from 'server/environment';
import Token from 'server/token';

export const GET = async () => {
  const location = 'toronto';
  const url = new URL(ServerEnvironment.getBaseURL() + '/api/weather');
  url.searchParams.set('query', location);
  url.searchParams.set('token', await Token.sign({ query: location }));
  const response = await fetch(url);
  const formData = new FormData();
  const filename = new Date().getTime().toString() + '.png';
  formData.set(
    'payload_json',
    JSON.stringify({
      attachments: [{ filename, id: 0 }],
      content: DiscordResponses.GoodMorning,
    }),
  );
  formData.set('files[0]', await response.blob(), filename);
  const encoder = new FormDataEncoder(formData);
  const iterator = encoder.encode();
  await fetch('https://discord.com/api/v10/channels/921103284528377876/messages', {
    body: new ReadableStream({
      async pull(controller) {
        const { value, done } = await iterator.next();
        if (done) {
          return controller.close();
        }
        controller.enqueue(value);
      },
    }),
    duplex: 'half',
    headers: Object.assign({ Authorization: 'Bot ' + process.env.DISCORD_BOT_TOKEN }, encoder.headers),
    method: 'POST',
  });
  return NextResponse.json({ url });
};
