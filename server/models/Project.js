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

const assignedEmployeeSchema = new mongoose.Schema({
  employeeId: String,
  employeeName: String,
  perHour: { type: Number, min: 0 },
  empHours: { type: Number, min: 0 },
  empAmount: { type: Number, min: 0 }
});

const projectSchema = new mongoose.Schema({
  projectId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  jobName: { type: String, required: true },
  customerId: { type: String, required: true },
  proCode: mongoose.Schema.Types.Mixed,
  managerId: String,
  assignedEmployeeIds: [assignedEmployeeSchema],
  totalCost: { type: Number, default: 0, min: 0 },
  totalHours: { type: Number, default: 0, min: 0 },
  perHourCost: { type: Number, default: 0, min: 0 },
  status: { type: String, enum: ['Open', 'In-progress', 'Completed'], default: 'Open' },
  locked: { type: Boolean, default: false },
  completedAt: Date,
  autoTransitioned: { type: Boolean, default: false },
  actualHours: { type: Number, min: 0 },
  createdBy: String,
  updatedBy: String,
  recordTracking: [recordTrackingSchema]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema);