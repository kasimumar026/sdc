import mongoose from "mongoose";

const url = "mongodb+srv://hahmad1178_db_user:STYnMQDBVX2jEjP@yaahazacluster.yd4dtyk.mongodb.net/sdcsmartdata?retryWrites=true&w=majority&appName=YaahazaCluster";

if (!url) {
  // Don't exit the process at import time — callers will receive a clear error when they try to connect.
  // Exiting during module import makes API routes disappear in dev when the env isn't set.
  console.warn("Missing NEXT_MONGODB_URL environment variable — connectDB will throw when called.");
}


type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalAny: any = global;

if (!globalAny._mongooseCache) {
  globalAny._mongooseCache = { conn: null, promise: null } as MongooseCache;
}

const cached: MongooseCache = globalAny._mongooseCache;

const connectDB = async () => {
  if (!url) {
    throw new Error("Missing NEXT_MONGODB_URL environment variable");
  }
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(url, { autoIndex: false })
      .then((m) => {
        return m;
      })
      .catch((err) => {
        // clear promise so future calls can retry
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;