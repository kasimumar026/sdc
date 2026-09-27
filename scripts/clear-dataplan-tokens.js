const mongoose = require("mongoose");

const url =
  process.env.MONGODB_URI ||
  "mongodb+srv://hahmad1178_db_user:STYnMQDBVX2jEjP@yaahazacluster.yd4dtyk.mongodb.net/sdcsmartdata?retryWrites=true&w=majority&appName=YaahazaCluster";

async function clearTokens() {
  await mongoose.connect(url, { autoIndex: false });
  console.log("Connected to MongoDB");

  const collection = mongoose.connection.db.collection("datams");

  const result = await collection.updateMany(
    { token: { $exists: true, $ne: "" } },
    { $set: { token: "" } }
  );

  console.log(`Cleared token on ${result.modifiedCount} documents.`);
  console.log(
    `Documents still holding a non-empty token: ${
      await collection.countDocuments({ token: { $exists: true, $nin: ["", null] } })
    }`
  );

  await mongoose.disconnect();
}

clearTokens().catch(async (err) => {
  console.error("Update failed:", err.message);
  await mongoose.disconnect();
  process.exit(1);
});
