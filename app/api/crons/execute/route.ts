import { Document } from 'mongodb';
import ServerEnvironment from 'server/environment';
import MDBLocation from 'server/models/locations';
import MongoDBClientFactory from 'server/mongodb';
import Token from 'server/token';

export const GET = async () => {
  const db = await MongoDBClientFactory.getInstance();
  const docs = await db.collection('locations').find({ owner: process.env.DISCORD_OWNER_ID });
  const locations = (await docs.toArray()).map((doc: Document) => MDBLocation.fromDocument(doc));
  const promises = [];
  for (const location of locations) {
    const url = new URL(ServerEnvironment.getBaseURL() + '/api/crons/jobs/goodmorning');
    const query = `${location.city},${location.state},${location.country}`;
    url.searchParams.set('query', query);
    url.searchParams.set('token', await Token.sign({ query }));
    promises.push(fetch(url, { cache: 'no-store' }));
  }
  await Promise.allSettled(promises);
  return new Response(undefined, { status: 202 });
};
