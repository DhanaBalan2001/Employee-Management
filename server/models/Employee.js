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

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  name: { type: String, required: true },
  personalEmail: { type: String, required: true },
  dateOfBirth: Date,
  address: String,
  designation: String,
  experienceYears: { type: Number, default: 0, min: 0 },
  bloodGroup: String,
  perHoursCharge: { type: Number, default: 0, min: 0 },
  emCategory: String,
  personalMobile: String,
  companyEmail: String,
  companyMobile: String,
  createdBy: String,
  updatedBy: String,
  recordTracking: [recordTrackingSchema]
}, { timestamps: true });

export default mongoose.model('Employee', employeeSchema);