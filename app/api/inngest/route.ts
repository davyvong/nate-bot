import { serve } from 'inngest/next';
import InngestAPI from 'server/apis/inngest';

export const { GET, POST, PUT } = serve(InngestAPI.getInstance(), InngestAPI.createFunctions());
