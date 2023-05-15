import PageHeading from 'components/page-heading';
import UserMenuButton from 'components/user-menu-button';
import { cookies } from 'next/headers';
import { Fragment } from 'react';
import type { FC } from 'react';
import DiscordAuthentication from 'server/discord/authentication';

import styles from './page.module.css';

/* @ts-expect-error Async Server Component */
const Page: FC = async () => {
  const token = await DiscordAuthentication.verifyTokenOrRedirect(cookies());

  return (
    <Fragment>
      <PageHeading secondary={<UserMenuButton token={token} />}>Discord Token</PageHeading>
      <pre className={styles.code}>{JSON.stringify(token, null, 2)}</pre>
    </Fragment>
  );
};

export default Page;
