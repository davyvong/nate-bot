import { Client } from '@upstash/qstash';

class QStashClientFactory {
  private static instance: Client = new Client({
    token: process.env.QSTASH_TOKEN,
  });

  public static getInstance(): Client {
    return QStashClientFactory.instance;
  }
}

export default QStashClientFactory;
