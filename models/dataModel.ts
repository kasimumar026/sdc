import mongoose from "mongoose";

export interface IDataPlan extends mongoose.Document {
  provider: string; // mtn, airtel, glo, smobile
  category: string; // e.g., gifting, sme, cooperate_gifting
  externalId?: number; // original id from data.ts if present
  name: string; // plan name like "1GB"
  buyingPrice: number;
  amount: number; // price in smallest currency unit (Naira)
  validity: string; // human readable validity
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
  },
  { timestamps: true },
);

DataPlanSchema.index(
  { provider: 1, category: 1, externalId: 1 },
  { unique: true, partialFilterExpression: { externalId: { $exists: true } } },
);

const DataPlan =
  mongoose.models.DataPlan ||
  mongoose.model<IDataPlan>("DataPlan", DataPlanSchema);

export default DataPlan;
