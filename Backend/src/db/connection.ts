import mongoose from "mongoose";

export async function connectMongo(uri: string) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, {
    dbName: process.env.MONGO_DB || undefined,
    autoIndex: true,
  });
  return mongoose.connection;
}
