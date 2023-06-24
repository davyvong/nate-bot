import { Document } from 'mongodb';
import { NextResponse } from 'next/server';
import MDBLocation from 'server/models/locations';
import MongoDBClientFactory from 'server/mongodb';

export const GET = async () => {
  const db = await MongoDBClientFactory.getInstance();
  const docs = await db.collection('locations').find({ owner: process.env.DISCORD_OWNER_ID });
  const locations = (await docs.toArray()).map((doc: Document) => MDBLocation.fromDocument(doc));
  return NextResponse.json(locations);
};
