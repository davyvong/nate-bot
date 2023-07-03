import { serve } from 'inngest/next';
import InngestAPI from 'server/inngest/api';

export const runtime = 'edge';

export const { GET, POST, PUT } = serve(InngestAPI.getInstance(), InngestAPI.createFunctions(), {
  streaming: 'allow',
});
