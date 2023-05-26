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
import classNames from 'classnames';
import Image from 'next/image';
import { FC, Fragment, useState } from 'react';
import DiscordAPI from 'server/discord/api';
import { DiscordToken } from 'server/discord/types';

import styles from './component.module.css';

interface UserMenuButtonProps {
  className?: string;
  height?: number;
  token: DiscordToken;
  width?: number;
}

const UserMenuButton: FC<UserMenuButtonProps> = ({ className, height = 42, token, width = 42 }) => {
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
        className={classNames(styles.avatar, className)}
        height={height}
        ref={refs.setReference}
        src={avatarURL.href}
        width={width}
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
