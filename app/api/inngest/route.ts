import { serve } from 'inngest/next';
import InngestAPI from 'server/inngest/api';

export const { GET, POST, PUT } = serve(InngestAPI.getInstance(), InngestAPI.createFunctions());
