import type { FC } from 'react';
import DiscordClient from 'server/apis/discord';

const Page: FC = () => {
  const url = DiscordClient.getOAuth2AuthorizeURL();

  return (
    <div>
      <a href={url.href}>Discord 0Auth Redirect</a>
    </div>
  );
};

export default Page;
