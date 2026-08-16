import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set');
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const tweets = db.collection('Tweet');

    const allTweets = await tweets.find({ retweetOfId: { $exists: true, $ne: null } }).toArray();
    let deletedCount = 0;

    for (const t of allTweets) {
      if (typeof t.retweetOfId === 'string' && t.retweetOfId.length !== 24) {
        await tweets.deleteOne({ _id: t._id });
        console.log(`Deleted invalid tweet: ${t._id} (retweetOfId was ${t.retweetOfId})`);
        deletedCount++;
      }
    }
    console.log(`Fixed ${deletedCount} tweets.`);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

main();
