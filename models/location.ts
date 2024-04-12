import type { Document } from 'mongodb';

export interface MDBLocationData {
  city: string;
  country: string;
  id: string;
  latitude: number;
  longitude: number;
  state: string;
}

class MDBLocation {
  public city: string;
  public country: string;
  public id: string;
  public latitude: number;
  public longitude: number;
  public state: string;

  constructor(data: MDBLocationData) {
    this.city = data.city;
    this.country = data.country;
    this.id = data.id;
    this.latitude = data.latitude;
    this.longitude = data.longitude;
    this.state = data.state;
  }

  public static fromDocument(doc: Document): MDBLocation {
    const data: MDBLocationData = {
      city: doc.city,
      country: doc.country,
      id: doc._id.toString(),
      latitude: doc.latitude,
      longitude: doc.longitude,
      state: doc.state,
    };
    return new MDBLocation(data);
  }

  public toPlainObject(): MDBLocationData {
    return {
      city: this.city,
      country: this.country,
      id: this.id,
      latitude: this.latitude,
      longitude: this.longitude,
      state: this.state,
    };
  }
}

export default MDBLocation;
