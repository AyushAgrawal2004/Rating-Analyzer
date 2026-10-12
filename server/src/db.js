import mongoose from "mongoose";

let mongodInstance = null;

/**
 * Connects to MongoDB using MONGODB_URI, falling back to mongodb-memory-server
 * if local MongoDB daemon is unreachable or in development.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/rating-analyzer";

  try {
    console.log(`[Database] Attempting connection to ${uri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[Database] Connected to external MongoDB successfully.`);
  } catch (err) {
    console.warn(`[Database] Connection to ${uri} failed (${err.message}).`);
    console.log(`[Database] Initializing in-memory MongoDB server fallback...`);

    try {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      mongodInstance = await MongoMemoryServer.create({
        instance: {
          dbName: "rating-analyzer",
        },
      });
      const memoryUri = mongodInstance.getUri();
      console.log(`[Database] Connecting to in-memory MongoDB at ${memoryUri}...`);
      await mongoose.connect(memoryUri);
      console.log(`[Database] In-memory MongoDB running successfully.`);
    } catch (memErr) {
      console.error(`[Database] Failed to start in-memory MongoDB:`, memErr);
      throw memErr;
    }
  }

  return mongoose.connection;
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}
