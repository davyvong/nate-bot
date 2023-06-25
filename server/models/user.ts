import type { Document, WithId } from 'mongodb';

export interface MDBUserData {
  discordId: string;
  permissions: MDBUserPermission[];
}

export enum MDBUserPermission {
  WriteSavedLocation = 'WriteSavedLocation',
}

class MDBUser {
  public discordId: string;
  public permissions: MDBUserPermission[];

  constructor(data: MDBUserData) {
    this.discordId = data.discordId;
    this.permissions = data.permissions;
  }

  public static fromDocument(doc: Document | WithId<Document>): MDBUser {
    const data: MDBUserData = {
      discordId: doc.discordId,
      permissions: doc.permissions,
    };
    return new MDBUser(data);
  }

  toPlainObject(): MDBUserData {
    return {
      discordId: this.discordId,
      permissions: this.permissions,
    };
  }
}

export default MDBUser;
