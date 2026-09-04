import { MongoClient, ObjectId } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();
async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI not set in environment.');
    return;
  }

  console.log(`Connecting to database...`);
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const tweets = db.collection('Tweet');
    const users = db.collection('User');
    console.log('Fetching tweets...');
    const allTweets = await tweets.find({}).toArray();
    console.log(`Found ${allTweets.length} tweets to check.`);

    let deletedCount = 0;
    for (const t of allTweets) {
      if (t.authorId) {
        let userObjId;
        try {
          // Depending on how Prisma stored it, it might already be an ObjectId or string.
          // If it's a string, we parse it. If it's an ObjectId, new ObjectId() is a safe no-op.
          userObjId = new ObjectId(t.authorId);
        } catch (e) {
          console.log(`Invalid authorId format for tweet ${t._id}: ${t.authorId}`);
          await tweets.deleteOne({ _id: t._id });
          deletedCount++;
          continue;
        }
        const userExists = await users.findOne({ _id: userObjId });
        if (!userExists) {
          console.log(
            `Deleted orphaned tweet: ${t._id} (authorId ${t.authorId} not found in User collection)`,
          );
          await tweets.deleteOne({ _id: t._id });
          deletedCount++;
        }
      } else {
        // missing authorId entirely
        console.log(`Deleted tweet with missing authorId: ${t._id}`);
        await tweets.deleteOne({ _id: t._id });
        deletedCount++;
      }
    }
    console.log(`Cleanup complete! Deleted ${deletedCount} orphaned tweets.`);
  } catch (e) {
    console.error('Error during cleanup:', e);
  } finally {
    await client.close();
  }
}
main();
