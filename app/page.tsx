import DiscordAPI from 'apis/discord';
import type { FC } from 'react';

const Page: FC = () => {
  const url = DiscordAPI.getOAuth2AuthorizeURL();

  return (
    <div>
      <a href={url.href}>Discord 0Auth Redirect</a>
    </div>
  );
};

export default Page;
