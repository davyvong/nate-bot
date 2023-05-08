import InngestAPI from 'server/apis/inngest';
import { serve } from 'inngest/next';

export const { GET, POST, PUT } = serve(InngestAPI.getInstance(), InngestAPI.createFunctions());
