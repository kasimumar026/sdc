import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["airtime", "data", "fund", "other"],
      default: "other",
    },
    amount: {
      type: Number,
      required: true,
    },
    txRef: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// In development hot-reloads the model and mongoose may keep an older registered model
// that doesn't match the updated schema (causing enum validation errors). To ensure
// the schema changes take effect, delete any existing model before creating a new one.
if (mongoose.models && mongoose.models.Transaction) {
  try {
    // delete the cached model so the new schema is used
    delete mongoose.models.Transaction;
  } catch (err) {
    // ignore
  }
}

export default mongoose.models["Transaction"] || mongoose.model("Transaction", transactionSchema);
