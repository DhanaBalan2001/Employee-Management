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

const userSchema = new mongoose.Schema({
  userId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  userName: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  employeeId: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Principal', 'Employee'], required: true },
  lastLogin: Date,
  createdBy: String,
  updatedBy: String,
  recordTracking: [recordTrackingSchema]
}, { timestamps: true });

export default mongoose.model('User', userSchema);