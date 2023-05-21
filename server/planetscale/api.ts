import { Connection, connect } from '@planetscale/database';

class PlanetScaleAPI {
  private static readonly instance: Connection = connect({
    url: process.env.DATABASE_URL,
  });

  public static getInstance(): Connection {
    return PlanetScaleAPI.instance;
  }
}

export default PlanetScaleAPI;
