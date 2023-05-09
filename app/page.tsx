import type { FC } from 'react';
import DiscordAPI from 'apis/discord';

const Page: FC = () => {
  const url = DiscordAPI.getOAuth2AuthorizeURL();

  return (
    <div>
      <a href={url.href}>Discord 0Auth Redirect</a>
    </div>
  );
};

export default Page;
