import { Document, ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import DiscordAuthentication from 'server/discord/authentication';
import MDBLocation from 'server/models/location';
import { MDBUserPermission } from 'server/models/user';
import MongoDBClientFactory from 'server/mongodb';
import { number, object, string } from 'yup';

export const DELETE = async (request: NextRequest) => {
  const token = await DiscordAuthentication.verifyToken(request.cookies);
  if (!token) {
    return new Response(undefined, { status: 401 });
  }
  const requestURL = new URL(request.url);
  const params = {
    id: requestURL.searchParams.get('id'),
  };
  const paramsSchema = object({
    id: string().required().length(24),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  const db = await MongoDBClientFactory.getInstance();
  const permissions = await DiscordAuthentication.getPermissions(token.id);
  if (!permissions.includes(MDBUserPermission.WriteSavedLocation)) {
    return new Response(undefined, { status: 401 });
  }
  await db.collection('locations').deleteOne({ _id: new ObjectId(params.id) });
  const locationDocs = await db.collection('locations').find();
  const locations = (await locationDocs.toArray()).map((doc: Document) => MDBLocation.fromDocument(doc));
  return NextResponse.json(locations);
};

export const GET = async () => {
  const db = await MongoDBClientFactory.getInstance();
  const docs = await db.collection('locations').find();
  const locations = (await docs.toArray()).map((doc: Document) => MDBLocation.fromDocument(doc));
  return NextResponse.json(locations);
};

export const POST = async (request: NextRequest) => {
  const token = await DiscordAuthentication.verifyToken(request.cookies);
  if (!token) {
    return new Response(undefined, { status: 401 });
  }
  const body = await request.json();
  const bodySchema = object({
    city: string().required(),
    country: string().required(),
    latitude: number().required(),
    longitude: number().required(),
    state: string(),
  });
  if (!bodySchema.isValidSync(body)) {
    return new Response(undefined, { status: 400 });
  }
  const db = await MongoDBClientFactory.getInstance();
  const permissions = await DiscordAuthentication.getPermissions(token.id);
  if (!permissions.includes(MDBUserPermission.WriteSavedLocation)) {
    return new Response(undefined, { status: 401 });
  }
  await db.collection('locations').insertOne(body);
  const docs = await db.collection('locations').find();
  const locations = (await docs.toArray()).map((doc: Document) => MDBLocation.fromDocument(doc));
  return NextResponse.json(locations);
};
