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
  if (
    params.permissions.includes(MDBUserPermission.UserPermissionsCreate) ||
    params.permissions.includes(MDBUserPermission.UserPermissionsDelete)
  ) {
    return new Response(undefined, { status: 401 });
  }
  const permissions = await DiscordAuthentication.getPermissions(token.id);
  if (!permissions.includes(MDBUserPermission.UserPermissionsDelete)) {
    return new Response(undefined, { status: 401 });
  }
  const db = await MongoDBClientFactory.getInstance();
  const pull: SetFields<Document> = { permissions: { $in: params.permissions } };
  const userDoc = await db
    .collection('users')
    .findOneAndUpdate({ discordId: params.id }, { $pull: pull }, { returnDocument: ReturnDocument.AFTER });
  if (!userDoc) {
    return new Response(undefined, { status: 404 });
  }
  const user = MDBUser.fromDocument(userDoc);
  return NextResponse.json(user.permissions);
};

export const GET = async (request: NextRequest) => {
  const token = await DiscordAuthentication.verifyToken(request.cookies);
  if (!token) {
    return new Response(undefined, { status: 401 });
  }
  const db = await MongoDBClientFactory.getInstance();
  const userDoc = await db.collection('users').findOne({ discordId: token.id });
  if (!userDoc) {
    return new Response(undefined, { status: 401 });
  }
  const user = MDBUser.fromDocument(userDoc);
  return NextResponse.json(user.permissions);
};

export const POST = async (request: NextRequest) => {
  try {
    const token = await DiscordAuthentication.verifyToken(request.cookies);
    if (!token) {
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
      body.permissions.includes(MDBUserPermission.UserPermissionsCreate) ||
      body.permissions.includes(MDBUserPermission.UserPermissionsDelete)
    ) {
      return new Response(undefined, { status: 401 });
    }
    const permissions = await DiscordAuthentication.getPermissions(token.id);
    if (!permissions.includes(MDBUserPermission.UserPermissionsCreate)) {
      return new Response(undefined, { status: 401 });
    }
    const db = await MongoDBClientFactory.getInstance();
    const addToSet: SetFields<Document> = { permissions: { $each: body.permissions } };
    const userDoc = await db
      .collection('users')
      .findOneAndUpdate({ discordId: body.id }, { $addToSet: addToSet }, { returnDocument: ReturnDocument.AFTER });
    if (!userDoc) {
      return new Response(undefined, { status: 404 });
    }
    const user = MDBUser.fromDocument(userDoc);
    return NextResponse.json(user.permissions);
  } catch (error: unknown) {
    console.log(error);
    return new Response(undefined, { status: 500 });
  }
};
