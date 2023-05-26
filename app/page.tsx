import PageHeading from 'components/page-heading';
import UserMenuButton from 'components/user-menu-button';
import { cookies } from 'next/headers';
import { FC, Fragment } from 'react';
import DiscordAuthentication from 'server/discord/authentication';

/* @ts-expect-error Async Server Component */
const Page: FC = async () => {
  const token = await DiscordAuthentication.verifyTokenOrRedirect(cookies());

  return (
    <Fragment>
      <PageHeading secondary={<UserMenuButton token={token} />}>Discord Token</PageHeading>
    </Fragment>
  );
};

export default Page;
