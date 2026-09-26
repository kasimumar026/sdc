import mongoose from "mongoose";

export interface IDataPlan extends mongoose.Document {
  provider: string; // mtn, airtel, glo, smobile
  category: string; // e.g., gifting, sme, cooperate_gifting
  externalId?: number; // original id from data.ts if present
  name: string; // plan name like "1GB"
  buyingPrice: number;
  amount: number; // price in smallest currency unit (Naira)
  validity: string; // human readable validity
  token: string; // Token for the data plan
  providerId: mongoose.Types.ObjectId; // Reference to the Provider model
  publish: boolean;
}

const DataPlanSchema = new mongoose.Schema<IDataPlan>(
  {
    provider: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    externalId: { type: Number },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    buyingPrice: { type: Number, required: false },
    validity: { type: String },
    publish: { type: Boolean, default: true },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
    },
    token: { type: String, required: true },
  },
  { timestamps: true },
);

DataPlanSchema.index(
  { category: 1, externalId: 1 },
  { unique: true, partialFilterExpression: { externalId: { $exists: true } } },
);

const DataM =
  mongoose.models.DataM ||
  mongoose.model<IDataPlan>("DataM", DataPlanSchema);

export default DataM;
