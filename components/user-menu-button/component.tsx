'use client';

import {
  offset,
  shift,
  useClick,
  useDismiss,
  useFloating,
  useInteractions,
  useTransitionStyles,
} from '@floating-ui/react';
import DiscordAPI from 'server/discord';
import type { DiscordToken } from 'server/discord/types';
import Image from 'next/image';
import { Fragment, useState } from 'react';
import type { FC } from 'react';

import styles from './component.module.css';

interface UserMenuButtonProps {
  token: DiscordToken;
}

const UserMenuButton: FC<UserMenuButtonProps> = ({ token }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { context, floatingStyles, refs } = useFloating({
    middleware: [offset(8), shift({ padding: 32 })],
    onOpenChange: setIsOpen,
    open: isOpen,
  });
  const click = useClick(context);
  const dismiss = useDismiss(context);
  const { getFloatingProps, getReferenceProps } = useInteractions([click, dismiss]);
  const { isMounted, styles: transitionStyles } = useTransitionStyles(context);

  const avatarURL = DiscordAPI.getUserAvatarURL(token.id, token.avatar);

  return (
    <Fragment>
      <Image
        {...getReferenceProps()}
        alt={token.username}
        className={styles.avatar}
        height={42}
        ref={refs.setReference}
        src={avatarURL.href}
        width={42}
      />
      {isMounted && (
        <div
          {...getFloatingProps()}
          className={styles.popover}
          ref={refs.setFloating}
          style={{ ...floatingStyles, ...transitionStyles }}
        >
          <div className={styles.userInfo}>
            <div className={styles.loggedInAs}>Logged in as</div>
            <div className={styles.username}>
              {token.username}
              <span className={styles.discriminator}>#{token.discriminator}</span>
            </div>
          </div>
          <button className={styles.logoutButton}>Logout</button>
        </div>
      )}
    </Fragment>
  );
};

export default UserMenuButton;
