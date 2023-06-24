import type { Document } from 'mongodb';

export interface MDBLocationData {
  city: string;
  country: string;
  id: string;
  latitude: number;
  longitude: number;
  owner: string;
  state: string;
}

class MDBLocation {
  public city: string;
  public country: string;
  id: string;
  public latitude: number;
  public longitude: number;
  public owner: string;
  public state: string;

  constructor(data: MDBLocationData) {
    this.city = data.city;
    this.country = data.country;
    this.id = data.id;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.owner = data.owner;
    this.state = data.state;
  }

  public static fromDocument(doc: Document): MDBLocation {
    const data: MDBLocationData = {
      city: doc.city,
      country: doc.country,
      id: doc._id.toString(),
      latitude: doc.latitude,
      longitude: doc.longitude,
      owner: doc.owner,
      state: doc.state,
    };
    return new MDBLocation(data);
  }

  toPlainObject(): MDBLocationData {
    return {
      city: this.city,
      country: this.country,
      id: this.id,
      latitude: this.latitude,
      longitude: this.longitude,
      owner: this.owner,
      state: this.state,
    };
  }
}

export default MDBLocation;
