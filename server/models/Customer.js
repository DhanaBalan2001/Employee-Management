import mongoose from 'mongoose';

const recordTrackingSchema = new mongoose.Schema({
  id: Number,
  module: String,
  method: String,
  userId: String,
  userName: String,
  modifiedAt: { type: Date, default: Date.now },
  changedFields: mongoose.Schema.Types.Mixed
});

const customerSchema = new mongoose.Schema({
  customerId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  custName: { type: String, required: true },
  custCode: { type: String, required: true, unique: true },
  custAddress: String,
  createdBy: String,
  updatedBy: String,
  recordTracking: [recordTrackingSchema]
}, { timestamps: true });

export default mongoose.model('Customer', customerSchema);