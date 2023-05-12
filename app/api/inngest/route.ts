import { serve } from 'inngest/next';
import InngestAPI from 'server/inngest';

export const { GET, POST, PUT } = serve(InngestAPI.getInstance(), InngestAPI.createFunctions());
