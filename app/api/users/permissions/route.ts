import { ReturnDocument, SetFields } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';
import DiscordAuthentication from 'server/discord/authentication';
import MDBUser, { MDBUserPermission } from 'server/models/user';
import MongoDBClientFactory from 'server/mongodb';
import { array, mixed, object, string } from 'yup';

export const DELETE = async (request: NextRequest) => {
  const token = await DiscordAuthentication.verifyToken(request.cookies);
  if (!token) {
    return new Response(undefined, { status: 401 });
  }
  const permissions = await DiscordAuthentication.getPermissions(token.id);
  if (!permissions.includes(MDBUserPermission.WriteUserPermission)) {
    return new Response(undefined, { status: 401 });
  }
  const requestURL = new URL(request.url);
  const params = {
    permissions: (requestURL.searchParams.get('permissions') || '').split(','),
  };
  const paramsSchema = object({
    id: string().required().length(18),
    permissions: array()
      .of(mixed<MDBUserPermission>().oneOf(Object.values(MDBUserPermission)).required())
      .required(),
  });
  if (!paramsSchema.isValidSync(params)) {
    return new Response(undefined, { status: 400 });
  }
  const db = await MongoDBClientFactory.getInstance();
  const userDoc = await db.collection('users').findOne({ discordId: token.id });
  if (!userDoc) {
    return new Response(undefined, { status: 404 });
  }
  const pull: SetFields<Document> = { permissions: { $in: params.permissions } };
  const updatedUserDoc = await db
    .collection('users')
    .findOneAndUpdate({ discordId: token.id }, { $pull: pull }, { returnDocument: ReturnDocument.AFTER });
  const user = MDBUser.fromDocument(updatedUserDoc);
  return NextResponse.json(user.permissions, { status: 200 });
};

export const POST = async (request: NextRequest) => {
  try {
    const token = await DiscordAuthentication.verifyToken(request.cookies);
    if (!token) {
      return new Response(undefined, { status: 401 });
    }
    const permissions = await DiscordAuthentication.getPermissions(token.id);
    if (
      !permissions.includes(MDBUserPermission.WriteEverything) &&
      !permissions.includes(MDBUserPermission.WriteUserPermission)
    ) {
      return new Response(undefined, { status: 401 });
    }
    const body = await request.json();
    const bodySchema = object({
      id: string().required().length(18),
      permissions: array()
        .of(mixed<MDBUserPermission>().oneOf(Object.values(MDBUserPermission)).required())
        .required(),
    });
    if (!bodySchema.isValidSync(body)) {
      return new Response(undefined, { status: 400 });
    }
    if (
      (body.permissions.includes(MDBUserPermission.WriteEverything) ||
        body.permissions.includes(MDBUserPermission.WriteUserPermission)) &&
      !permissions.includes(MDBUserPermission.WriteEverything)
    ) {
      return new Response(undefined, { status: 401 });
    }
    const db = await MongoDBClientFactory.getInstance();
    const userDoc = await db.collection('users').findOne({ discordId: body.id });
    if (!userDoc) {
      return new Response(undefined, { status: 404 });
    }
    const addToSet: SetFields<Document> = { permissions: { $each: body.permissions } };
    const updatedUserDoc = await db
      .collection('users')
      .findOneAndUpdate({ discordId: token.id }, { $addToSet: addToSet }, { returnDocument: ReturnDocument.AFTER });
    const user = MDBUser.fromDocument(updatedUserDoc);
    return NextResponse.json(user.permissions, { status: 200 });
  } catch (error: unknown) {
    console.log(error);
    return new Response(undefined, { status: 500 });
  }
};
