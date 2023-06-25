import SearchLocations from 'components/browse-locations';
import PageHeading from 'components/page-heading';
import UserMenuButton from 'components/user-menu-button';
import { cookies } from 'next/headers';
import { Fragment } from 'react';
import DiscordAuthentication from 'server/discord/authentication';

import styles from './page.module.css';

const Page = async (): Promise<JSX.Element> => {
  const token = await DiscordAuthentication.verifyTokenOrRedirect(cookies());

  const permissions = await DiscordAuthentication.getPermissions(token.id);

  return (
    <Fragment>
      <PageHeading secondary={<UserMenuButton className={styles.userButton} token={token} />}>Browse</PageHeading>
      <SearchLocations permissions={permissions} />
    </Fragment>
  );
};

export default Page;
