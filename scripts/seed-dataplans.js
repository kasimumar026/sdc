const mongoose = require("mongoose");
const { dataplans } = require("../app.js");

const url =
  process.env.MONGODB_URI ||
  "mongodb+srv://hahmad1178_db_user:STYnMQDBVX2jEjP@yaahazacluster.yd4dtyk.mongodb.net/sdcsmartdata?retryWrites=true&w=majority&appName=YaahazaCluster";

const toObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value) ? new mongoose.Types.ObjectId(value) : value;

const toDate = (value) => (value ? new Date(value) : undefined);

const normalize = (plan) => {
  const doc = { ...plan };

  if (plan._id) doc._id = toObjectId(plan._id);
  if (plan.providerId) doc.providerId = toObjectId(plan.providerId);

  if (plan.createdAt) doc.createdAt = toDate(plan.createdAt);
  if (plan.updatedAt) doc.updatedAt = toDate(plan.updatedAt);

  delete doc.__v;

  return doc;
};

async function seed() {
  await mongoose.connect(url, { autoIndex: false });
  console.log("Connected to MongoDB");

  const docs = dataplans.map(normalize);
  const collection = mongoose.connection.db.collection("datams");

  const existing = await collection
    .find({ _id: { $in: docs.map((d) => d._id) } })
    .toArray();
  const existingIds = new Set(existing.map((d) => d._id.toString()));

  const toInsert = docs.filter((d) => !existingIds.has(d._id.toString()));

  if (toInsert.length === 0) {
    console.log("All documents already exist — nothing inserted.");
  } else {
    const result = await collection.insertMany(toInsert, { ordered: false });
    console.log(`Inserted ${result.insertedCount} documents into "dataplans".`);
  }

  const total = await collection.countDocuments();
  console.log(`Collection "dataplans" now has ${total} documents.`);

  await mongoose.disconnect();
}

seed().catch(async (err) => {
  console.error("Seed failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
