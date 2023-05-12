import DiscordAuthentication from 'apis/discord/authentication';
import PageHeading from 'components/page-heading';
import UserMenuButton from 'components/user-menu-button';
import { Fragment } from 'react';
import type { FC } from 'react';

/* @ts-expect-error Async Server Component */
const Page: FC = async () => {
  const token = await DiscordAuthentication.verifyToken();

  return (
    <Fragment>
      <PageHeading secondary={<UserMenuButton token={token} />}>Discord Token</PageHeading>
      <pre>{JSON.stringify(token, null, 2)}</pre>
    </Fragment>
  );
};

export default Page;
