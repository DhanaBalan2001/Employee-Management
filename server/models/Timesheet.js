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

const timesheetSchema = new mongoose.Schema({
  timesheetId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
  projectId: { type: String, required: true },
  projectName: String,
  projectCode: String,
  employeeId: { type: String, required: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true, min: 0 },
  weekStart: Date,
  status: { type: String, enum: ['Open', 'InProgress', 'Submitted', 'Approved', 'Rejected'], default: 'Open' },
  totalWeekHours: { type: Number, default: 0, min: 0 },
  locked: { type: Boolean, default: false },
  completedAt: Date,
  autoTransitioned: { type: Boolean, default: false },
  transitionedAt: Date,
  approvedAt: Date,
  submittedAt: Date,
  weekCompleted: { type: Boolean, default: false },
  createdBy: String,
  updatedBy: String,
  recordTracking: [recordTrackingSchema]
}, { timestamps: true });

export default mongoose.model('Timesheet', timesheetSchema);