import InngestAPI from 'apis/inngest';
import { serve } from 'inngest/next';

export default serve(InngestAPI.getInstance(), InngestAPI.createFunctions());
