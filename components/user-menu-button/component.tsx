import DiscordAPI from 'apis/discord';
import type { DiscordToken } from 'apis/discord/types';
import Image from 'next/image';
import { Fragment } from 'react';
import type { FC } from 'react';

import styles from './component.module.css';

interface UserMenuButtonProps {
  token: DiscordToken;
}

const UserMenuButton: FC<UserMenuButtonProps> = ({ token }) => {
  const avatarURL = DiscordAPI.getUserAvatarURL(token.id, token.avatar);

  return (
    <Fragment>
      <Image alt={token.username} className={styles.avatar} height={42} src={avatarURL.href} width={42} />
      {/* <span>
        {token.username}#{token.discriminator}
      </span> */}
    </Fragment>
  );
};

export default UserMenuButton;
