import PageHeading from 'components/page-heading';
import SavedLocations from 'components/saved-locations';
import UserMenuButton from 'components/user-menu-button';
import { cookies } from 'next/headers';
import { Fragment } from 'react';
import DiscordAuthentication from 'services/discord/authentication';

import styles from './page.module.css';

const Page = async (): Promise<JSX.Element> => {
  const token = await DiscordAuthentication.verifyTokenOrRedirect(cookies());

  const permissions = await DiscordAuthentication.getPermissions(token.id);

  return (
    <Fragment>
      <PageHeading secondary={<UserMenuButton className={styles.userButton} token={token} />}>
        Saved Locations
      </PageHeading>
      <SavedLocations permissions={permissions} />
    </Fragment>
  );
};

export default Page;
