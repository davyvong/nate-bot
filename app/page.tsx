import PageHeading from 'components/page-heading';
import UserMenuButton from 'components/user-menu-button';
import { cookies } from 'next/headers';
import { Fragment } from 'react';
import DiscordAuthentication from 'server/discord/authentication';

import styles from './page.module.css';

const Page = async (): Promise<JSX.Element> => {
  const token = await DiscordAuthentication.verifyTokenOrRedirect(cookies());

  return (
    <Fragment>
      <PageHeading secondary={<UserMenuButton className={styles.userButton} token={token} />}>Hello World</PageHeading>
    </Fragment>
  );
};

export default Page;
