import { MongoClient, Db } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;
let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error('Missing required environment variable: MONGODB_URI');
}

if (process.env.NODE_ENV === 'production') {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default async function db(): Promise<Db> {
  const client = await clientPromise;
  const database = client.db('Tweeter');
  return database;
}

console.log('Connecting to:', process.env.MONGODB_URI ? 'URI Found' : 'URI Missing');
