import { MongoClient } from 'mongodb';
import type { Db } from 'mongodb';

class MongoDBClientFactory {
  private static uri = process.env.MONGODB_URI;
  private static database = MongoDBClientFactory.uri.split('/').at(-1);
  private static instance: MongoClient;

  public static async getInstance(): Promise<Db> {
    if (!MongoDBClientFactory.instance) {
      MongoDBClientFactory.instance = new MongoClient(MongoDBClientFactory.uri);
      await MongoDBClientFactory.instance.connect();
    }
    return MongoDBClientFactory.instance.db(MongoDBClientFactory.database);
  }
}

export default MongoDBClientFactory;
